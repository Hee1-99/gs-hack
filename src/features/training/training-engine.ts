import { z } from 'zod';
import { trainingSteps, legacyTrainingSteps, type TrainingMode } from './training-data';
export type GradingMode = 'gemini' | 'demo' | 'objective';
export type TrainingAnswer = { stepId:string;choiceId:string;correct:boolean;answeredAt:string;answerText?:string;elapsedMs?:number;accuracyPoints?:number;timeBonus?:number;gradingMode?:GradingMode;feedback?:string };
export type TrainingAttempt = {id:string;mode:TrainingMode;candidateName:string;courseVersion:1|2;startedAt:string;completedAt:string|null;status:'active'|'completed';answers:TrainingAnswer[];score:number|null;stepIds?:string[];stageStartedAt?:string|null;accuracyScore?:number|null;timeScore?:number|null;totalElapsedMs?:number};
export type TrainingState = {version:1;attempts:TrainingAttempt[]};
export type AnswerDetails = Pick<TrainingAnswer,'answerText'|'elapsedMs'|'accuracyPoints'|'gradingMode'|'feedback'>;
export function getAttemptSteps(attempt:TrainingAttempt) {return attempt.courseVersion === 1 ? legacyTrainingSteps : (attempt.stepIds ?? []).map(id=>trainingSteps.find(step=>step.id===id)!).filter(Boolean);}
export function createTrainingAttempt(mode:TrainingMode,candidateName:string,chapter?:string):TrainingAttempt {
  const startedAt=new Date().toISOString();
  const steps=chapter ? trainingSteps.filter(step=>step.chapter===chapter) : trainingSteps;
  return {id:crypto.randomUUID(),mode,candidateName:candidateName.trim().slice(0,40)||'스토어 매니저',courseVersion:2,startedAt,completedAt:null,status:'active',answers:[],score:null,stepIds:(steps.length?steps:trainingSteps).map(step=>step.id),stageStartedAt:startedAt,accuracyScore:null,timeScore:null,totalElapsedMs:0};
}
// No time penalty to accuracy. A correct answer within3min earns10; bonus tapers to0 at10min.
// Partial subjective answers below70 earn no speed points. Background/refresh time is included.
export function scoreTimeBonus(accuracy:number,elapsedMs:number) {return accuracy<70?0:Math.round(Math.max(0,Math.min(10,10*(600000-Math.max(0,elapsedMs))/420000))*10)/10;}
export function answerTrainingStep(attempt:TrainingAttempt,stepId:string,choiceId:string,details:AnswerDetails={}):TrainingAttempt {
  const steps=getAttemptSteps(attempt),step=steps[attempt.answers.length];
  if(attempt.status==='completed'||!step||step.id!==stepId)return attempt;
  const written=step.kind==='short-answer';
  if(written ? (!details.answerText?.trim()||!Number.isFinite(details.accuracyPoints)||!['gemini','demo'].includes(details.gradingMode??'')) : !step.choices.some(choice=>choice.id===choiceId))return attempt;
  const accuracy=written?Math.round(Math.max(0,Math.min(100,details.accuracyPoints!))):choiceId===step.correctChoiceId?100:0;
  const elapsedMs=Math.round(Math.max(0,Math.min(86400000,Number.isFinite(details.elapsedMs)?details.elapsedMs!:Date.now()-Date.parse(attempt.stageStartedAt??new Date().toISOString()))));
  const answeredAt=new Date().toISOString();
  const answer:TrainingAnswer={stepId,choiceId:written?'written':choiceId,correct:accuracy>=70,answeredAt,...(attempt.courseVersion===2?{answerText:written?details.answerText!.trim():undefined,elapsedMs,accuracyPoints:accuracy,timeBonus:scoreTimeBonus(accuracy,elapsedMs),gradingMode:written?details.gradingMode:'objective',feedback:written?details.feedback?.slice(0,1500):undefined}:{})};
  const answers=[...attempt.answers,answer],completed=answers.length===steps.length;
  if(attempt.courseVersion===1)return {...attempt,answers,status:completed?'completed':'active',completedAt:completed?answeredAt:null,score:completed?Math.round(answers.filter(a=>a.correct).length/steps.length*100):null};
  const accuracyScore=Math.round(answers.reduce((sum,a)=>sum+(a.accuracyPoints??0),0)/steps.length*.9*10)/10;
  const timeScore=Math.round(answers.reduce((sum,a)=>sum+(a.timeBonus??0),0)/steps.length*10)/10;
  return {...attempt,answers,status:completed?'completed':'active',completedAt:completed?answeredAt:null,stageStartedAt:null,totalElapsedMs:answers.reduce((sum,a)=>sum+(a.elapsedMs??0),0),accuracyScore:completed?accuracyScore:null,timeScore:completed?timeScore:null,score:completed?Math.round(accuracyScore+timeScore):null};
}
const answerSchema=z.object({stepId:z.string(),choiceId:z.string(),correct:z.boolean(),answeredAt:z.iso.datetime(),answerText:z.string().max(1500).optional(),elapsedMs:z.number().int().min(0).max(86400000).optional(),accuracyPoints:z.number().int().min(0).max(100).optional(),timeBonus:z.number().min(0).max(10).optional(),gradingMode:z.enum(['gemini','demo','objective']).optional(),feedback:z.string().max(1500).optional()});
const attemptSchema=z.object({id:z.string().min(1),mode:z.enum(['practice','test']),candidateName:z.string().min(1).max(40),courseVersion:z.union([z.literal(1),z.literal(2)]),startedAt:z.iso.datetime(),completedAt:z.iso.datetime().nullable(),status:z.enum(['active','completed']),score:z.number().int().min(0).max(100).nullable(),answers:z.array(answerSchema).max(36),stepIds:z.array(z.string()).min(1).max(36).optional(),stageStartedAt:z.iso.datetime().nullable().optional(),accuracyScore:z.number().min(0).max(90).nullable().optional(),timeScore:z.number().min(0).max(10).nullable().optional(),totalElapsedMs:z.number().int().min(0).optional()}).refine(attempt=>{
  const steps=getAttemptSteps(attempt);
  if(!steps.length||attempt.answers.length>steps.length)return false;
  if(attempt.courseVersion===2&&(!attempt.stepIds||new Set(attempt.stepIds).size!==attempt.stepIds.length||steps.length!==attempt.stepIds.length||attempt.stageStartedAt===undefined))return false;
  const completed=attempt.answers.length===steps.length;
  if((attempt.status==='completed')!==completed||(attempt.completedAt!==null)!==completed)return false;
  if(!attempt.answers.every((a,i)=>{const step=steps[i];if(a.stepId!==step.id)return false;
    if(attempt.courseVersion===1)return step.choices.some(c=>c.id===a.choiceId)&&a.correct===(a.choiceId===step.correctChoiceId);
    if(a.elapsedMs===undefined||a.accuracyPoints===undefined||a.timeBonus!==scoreTimeBonus(a.accuracyPoints,a.elapsedMs)||a.correct!==(a.accuracyPoints>=70))return false;
    return step.kind==='short-answer' ? Boolean(a.answerText?.trim())&&a.choiceId==='written'&&['demo','gemini'].includes(a.gradingMode??'') : step.choices.some(c=>c.id===a.choiceId)&&a.accuracyPoints===(a.choiceId===step.correctChoiceId?100:0)&&a.gradingMode==='objective';
  }))return false;
  if(attempt.courseVersion===1)return attempt.score===(completed?Math.round(attempt.answers.filter(a=>a.correct).length/steps.length*100):null);
  const accuracy=Math.round(attempt.answers.reduce((s,a)=>s+a.accuracyPoints!,0)/steps.length*.9*10)/10,time=Math.round(attempt.answers.reduce((s,a)=>s+a.timeBonus!,0)/steps.length*10)/10;
  return attempt.totalElapsedMs===attempt.answers.reduce((s,a)=>s+a.elapsedMs!,0)&&attempt.accuracyScore===(completed?accuracy:null)&&attempt.timeScore===(completed?time:null)&&attempt.score===(completed?Math.round(accuracy+time):null)&&(!completed||attempt.stageStartedAt===null);
});
export function validateTrainingAttempt(value:unknown):TrainingAttempt|null {const result=attemptSchema.safeParse(value);return result.success?result.data:null;}
export function parseTrainingState(raw:string|null):TrainingState {
  if(!raw)return {version:1,attempts:[]};
  try{const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.attempts)||parsed.attempts.length>500)return {version:1,attempts:[]};
    const attempts:TrainingAttempt[]=[];for(const item of parsed.attempts){const valid=validateTrainingAttempt(item);if(valid&&!attempts.some(a=>a.id===valid.id))attempts.push(valid);}return {version:1,attempts};
  }catch{return {version:1,attempts:[]};}
}
