import { z } from 'zod';
const gradeSchema=z.object({stepId:z.string(),score:z.number().int().min(0).max(100),feedback:z.string().min(1).max(1500),mode:z.enum(['gemini','demo'])});
export async function requestTrainingGrade(stepId:string,answer:string) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),22000);
  try {const response=await fetch('/api/ai/training-grade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stepId,answer}),signal:controller.signal});if(!response.ok)throw new Error('grade unavailable');const grade=gradeSchema.parse(await response.json());if(grade.stepId!==stepId)throw new Error('mismatched stage');return grade;}
  finally {clearTimeout(timer);}
}
