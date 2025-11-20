import React, { useEffect, useState } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string; // For displaying "HP" text
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, label }) => {
  const [displayHp, setDisplayHp] = useState(current);
  
  // Smooth transition effect
  useEffect(() => {
    const diff = Math.abs(displayHp - current);
    if (diff === 0) return;

    // Adjust speed based on difference
    const step = Math.ceil(diff / 10);
    
    const timer = setTimeout(() => {
      if (displayHp > current) {
        setDisplayHp(prev => Math.max(current, prev - step));
      } else if (displayHp < current) {
        setDisplayHp(prev => Math.min(current, prev + step));
      }
    }, 20);
    
    return () => clearTimeout(timer);
  }, [current, displayHp]);

  const percentage = Math.max(0, Math.min(100, (displayHp / max) * 100));
  
  let barColor = "bg-green-500";
  if (percentage < 50) barColor = "bg-yellow-400";
  if (percentage < 20) barColor = "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-0.5">
          {label && <div className="bg-slate-800 text-yellow-400 text-[9px] font-black px-1 rounded-sm">HP</div>}
          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-500 relative">
            {/* Gloss effect */}
            <div className="absolute top-0 left-0 w-full h-[50%] bg-white opacity-10 z-10"></div>
            <div 
              className={`h-full ${barColor} transition-all duration-100 ease-out relative`} 
              style={{ width: `${percentage}%` }}
            >
                <div className="absolute right-0 top-0 bottom-0 w-px bg-black opacity-20"></div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default HealthBar;