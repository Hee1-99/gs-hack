import { ChatTraining } from '@/features/chat-training/chat-training';
import { getScenarioFacts } from '@/features/chat-training/scenario-facts';
export default function ChatPracticePage() { return <ChatTraining scenarioFacts={{ promotion: getScenarioFacts('promotion'), complaint: getScenarioFacts('complaint'), refund: getScenarioFacts('refund') }}/>; }
