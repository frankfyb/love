import type { Scenario } from '@/constants/mock-data';

interface ScenarioCardProps {
  scenario: Scenario;
  onClick?: () => void;
}

const ScenarioCard = ({ scenario, onClick }: ScenarioCardProps) => (
  <div 
    key={scenario.id} 
    className={`${scenario.color} h-32 rounded-2xl flex items-center justify-center text-lg font-bold cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm`}
    onClick={onClick}
  >
    {scenario.title}
  </div>
);

export default ScenarioCard;