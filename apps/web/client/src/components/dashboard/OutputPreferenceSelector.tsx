const outputTypes = [
  { id: 'summary', label: 'Bite-Sized Summary', icon: '📝' },
  { id: 'diagram', label: 'Visual Diagram', icon: '📊' },
  { id: 'flowchart', label: 'Step-by-Step Flow', icon: '⚡' },
  { id: 'flashcards', label: 'Active Recall Cards', icon: '🎴' }
];

export const OutputSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {outputTypes.map((type) => (
        <button 
          key={type.id}
          className="p-6 glass-card hover:border-primary transition-all flex flex-col items-center gap-2"
          onClick={() => onSelect(type.id)}
        >
          <span className="text-3xl">{type.icon}</span>
          <span className="font-semibold">{type.label}</span>
        </button>
      ))}
    </div>
  );
};