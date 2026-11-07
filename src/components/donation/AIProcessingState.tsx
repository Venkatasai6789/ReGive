import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface AIProcessingStateProps {
  onComplete: () => void;
}

const STAGES = [
  { id: 1, label: 'Analysing image composition (CLIP feature extraction)' },
  { id: 2, label: 'Identifying donation category and physical condition' },
  { id: 3, label: 'Generating neural descriptive caption (BLIP model)' },
  { id: 4, label: 'Checking donation safety & perishability rules' },
  { id: 5, label: 'Finding suitable verified partners (MiniLM & FAISS)' }
];

export const AIProcessingState: React.FC<AIProcessingStateProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => onComplete(), 300);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[#FAFBF9] border border-[#E5E7E4] my-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F5E84D] flex items-center justify-center font-bold text-[#171717]">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-[#171717] font-['Manrope']">
            AI Intake & Safety Pipeline Active
          </h3>
          <p className="text-xs text-[#777777]">
            Processing donation image and checking safety parameters across models...
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {STAGES.map((stg) => {
          const isDone = stg.id < currentStage;
          const isCurrent = stg.id === currentStage;

          return (
            <div
              key={stg.id}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                isCurrent
                  ? 'bg-white border border-[#171717] shadow-xs'
                  : isDone
                  ? 'bg-white/60 border border-[#E5E7E4]'
                  : 'opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#23845B] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#171717] animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
              )}
              <span className={`text-xs font-semibold ${isCurrent ? 'text-[#171717]' : 'text-[#777777]'}`}>
                {stg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
