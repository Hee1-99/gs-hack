import { z } from 'zod';

const id = z.string().min(1).max(100);
const text = z.string().trim().min(1).max(2000);
const timestamp = z.iso.datetime();
export const ruleInputSchema = z.object({
  title: text.max(100), content: text, category: text.max(50), exception: text,
});
export const ruleSchema = ruleInputSchema.extend({
  id, version: z.number().int().positive(), updatedAt: timestamp,
  topic: z.enum(['promotion', 'inventory', 'general']),
  requirePosLookup: z.boolean(), requireManagerOnException: z.boolean(),
});
export const productSchema = z.object({ id, name: text.max(100), price: z.number().int().nonnegative(), inventory: z.number().int().nonnegative() });
export const promotionSchema = z.object({ id, productIds: z.array(id).min(1), buyQuantity: z.number().int().positive(), freeQuantity: z.number().int().positive(), allowMix: z.boolean() });
export const scenarioSchema = z.object({ id, title: text.max(100), productId: id, quantity: z.number().int().positive(), kind: z.enum(['single', 'mixed']), ruleIds: z.array(id).min(1), customerQuestion: text });
export const answerIntentSchema = z.enum(['apply', 'not_apply', 'check_manager']);
const eventBase = z.object({ id, at: timestamp });
export const eventSchema = z.discriminatedUnion('type', [
  eventBase.extend({ type: z.literal('customer'), text }),
  eventBase.extend({ type: z.literal('pos_lookup'), productId: id }),
  eventBase.extend({ type: z.literal('answer'), text, intent: answerIntentSchema, total: z.number().int().nonnegative().nullable() }),
  eventBase.extend({ type: z.literal('manager_confirmation') }),
]);
export const resultsSchema = z.object({ promotionLookupPerformed: z.boolean(), definitiveBeforeLookup: z.boolean(), finalAnswerCorrect: z.boolean(), managerConfirmationRequested: z.boolean(), procedureFollowed: z.boolean(), expectedTotal: z.number().int().nonnegative().nullable(), expectedIntent: answerIntentSchema });
export const snapshotSchema = z.object({ rules: z.array(ruleSchema), products: z.array(productSchema), promotions: z.array(promotionSchema) });
export const aiReplySchema = z.object({ content: text, mode: z.enum(['gemini', 'demo']), groundingRuleIds: z.array(id), results: resultsSchema.optional() });
export const sessionSchema = z.object({ id, previousAttemptId: id.nullable(), scenario: scenarioSchema, snapshot: snapshotSchema, events: z.array(eventSchema), status: z.enum(['active', 'completed']), createdAt: timestamp, results: resultsSchema.nullable(), customerMode: z.enum(['gemini', 'demo']).default('demo'), coaching: aiReplySchema.nullable().default(null) }).superRefine((session, context) => {
  const productIds = new Set(session.snapshot.products.map(product => product.id));
  const ruleIds = new Set(session.snapshot.rules.map(rule => rule.id));
  const validFacts = productIds.has(session.scenario.productId)
    && session.scenario.ruleIds.every(id => ruleIds.has(id))
    && session.snapshot.promotions.every(promotion => promotion.productIds.every(id => productIds.has(id)))
    && session.events.every(event => event.type !== 'pos_lookup' || productIds.has(event.productId));
  const validEvents = new Set(session.events.map(event => event.id)).size === session.events.length;
  const validCompletion = session.status !== 'completed' || (session.results !== null && session.events.some(event => event.type === 'answer'));
  if (!validFacts || !validEvents || !validCompletion) context.addIssue({ code: 'custom', message: '연습 기록의 근거나 행동 정보가 손상되었어요.' });
});
export const checklistItemInputSchema = z.object({ title: text.max(100), description: text, category: text.max(50) });
export const checklistItemSchema = checklistItemInputSchema.extend({ id });
export const checklistStatusSchema = z.enum(['pending', 'done', 'needs_manager']);
export const checklistDateSchema = z.iso.date();
export const checklistProgressSchema = z.object({ itemId: id, date: checklistDateSchema, status: checklistStatusSchema, updatedAt: timestamp });
// One answer includes both 2,000-character manual fields plus structured fact clauses.
export const manualSourceSchema = z.object({ id, title: text.max(100), url: z.url().refine(value => /^https?:\/\//.test(value)).optional(), excerpt: text, status: text.max(100), origin: z.enum(['bundled', 'upload']) });
export type ManualSource = z.infer<typeof manualSourceSchema>;
export const questionSchema = z.object({ id, question: text.max(500), answer: z.string().trim().min(1).max(6000), rules: z.array(ruleSchema), sources: z.array(manualSourceSchema).max(3).optional(), answerKind: z.enum(['manual', 'general', 'needs_confirmation']).optional(), status: z.enum(['resolved', 'unresolved']), mode: z.enum(['demo', 'live']), createdAt: timestamp });
export const stateSchema = z.object({
  schemaVersion: z.literal(1), store: z.object({ id, name: text.max(100), synthetic: z.literal(true) }),
  rules: z.array(ruleSchema).min(1), products: z.array(productSchema).length(3), promotions: z.array(promotionSchema).length(1), scenarios: z.array(scenarioSchema).length(2),
  sessions: z.array(sessionSchema), checklistItems: z.array(checklistItemSchema), checklistProgress: z.array(checklistProgressSchema), questions: z.array(questionSchema),
});
const legacyStateSchema = stateSchema.extend({
  checklistProgress: z.array(checklistProgressSchema.extend({ date: checklistDateSchema.optional() })),
});
export function localDateKey(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function parseStoreState(value: unknown, legacyDate = localDateKey()) {
  const parsed = legacyStateSchema.parse(value);
  return stateSchema.parse({ ...parsed, checklistProgress: parsed.checklistProgress.map(progress => ({ ...progress, date: progress.date ?? legacyDate })) });
}
export type StoreRule = z.infer<typeof ruleSchema>;
export type RuleInput = z.infer<typeof ruleInputSchema>;
export type Product = z.infer<typeof productSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type SimulationEvent = z.infer<typeof eventSchema>;
export type SimulationSession = z.infer<typeof sessionSchema>;
export type VerifiedResults = z.infer<typeof resultsSchema>;
export type SimulationFeedback = { text: string; results: VerifiedResults; mode: 'demo' | 'live' };
export type RuleSnapshot = z.infer<typeof snapshotSchema>;
export type AnswerIntent = z.infer<typeof answerIntentSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type ChecklistItemInput = z.infer<typeof checklistItemInputSchema>;
export type ChecklistProgress = z.infer<typeof checklistProgressSchema>;
export type ChecklistStatus = z.infer<typeof checklistStatusSchema>;
export type ChecklistDate = z.infer<typeof checklistDateSchema>;
export type QuestionLog = z.infer<typeof questionSchema>;
export type StoreState = z.infer<typeof stateSchema>;
export type Store = StoreState['store'];
