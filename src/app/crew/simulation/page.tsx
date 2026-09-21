import { TrainingShell } from '@/features/training/training-shell';
export default async function SimulationPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams;
  return <TrainingShell initialMode={params.mode === 'test' ? 'test' : 'practice'}/>;
}
