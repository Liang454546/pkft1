import React from 'react';
import { TypeName } from '../types';

interface BattleBackgroundProps {
  activeMoveType?: TypeName; // Use this to color lights
}

const BattleBackground: React.FC<BattleBackgroundProps> = ({ activeMoveType }) => {
  
  // Determine light color based on move type
  const getLightColor = () => {
      switch(activeMoveType) {
          case TypeName.Fire: return 'rgba(255, 50, 0, 0.6)';
          case TypeName.Electric: return 'rgba(255, 255, 0, 0.6)';
          case TypeName.Water: return 'rgba(0, 100, 255, 0.6)';
          case TypeName.Grass: return 'rgba(50, 255, 50, 0.6)';
          case TypeName.Psychic: return 'rgba(255, 0, 255, 0.6)';
          default: return 'rgba(255, 255, 255, 0.3)';
      }
  }

  const lightColor = getLightColor();

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-900">
      
      {/* --- STADIUM UPPER STANDS --- */}
      <div className="absolute top-0 w-full h-1/2 bg-slate-800 overflow-hidden">
         {/* Crowd Rows */}
         {[...Array(15)].map((_, r) => (
             <div key={r} className="absolute w-full h-2 bg-slate-800 border-b border-slate-700 flex justify-around" style={{ top: `${r * 8}px` }}>
                 {[...Array(40)].map((_, c) => (
                     <div 
                        key={c} 
                        className="w-1 h-1 rounded-full bg-slate-500 opacity-50 animate-crowd-wave"
                        style={{ 
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: Math.random() > 0.8 ? 'white' : '#64748b' 
                        }}
                     ></div>
                 ))}
             </div>
         ))}
      </div>

      {/* --- STADIUM LIGHTS --- */}
      {/* Left Spotlights */}
      <div className="absolute top-0 left-10 w-20 h-full pointer-events-none origin-top animate-[spotlight-sweep_4s_ease-in-out_infinite]">
          <div className="w-full h-[150%] bg-gradient-to-b from-white to-transparent" style={{ background: `linear-gradient(to bottom, ${lightColor}, transparent)` }}></div>
      </div>
      {/* Right Spotlights */}
      <div className="absolute top-0 right-10 w-20 h-full pointer-events-none origin-top animate-[spotlight-sweep_5s_ease-in-out_infinite_reverse]">
           <div className="w-full h-[150%] bg-gradient-to-b from-white to-transparent" style={{ background: `linear-gradient(to bottom, ${lightColor}, transparent)` }}></div>
      </div>

      {/* --- ARENA WALL --- */}
      <div className="absolute bottom-[35%] w-full h-12 bg-gradient-to-b from-slate-600 to-slate-800 border-t-4 border-slate-400 z-0">
           {/* Advertising Boards (Pixel style) */}
           <div className="w-full h-full flex justify-around items-center opacity-70">
               <div className="w-1/4 h-6 bg-blue-800 border border-white/20"></div>
               <div className="w-1/4 h-6 bg-red-800 border border-white/20"></div>
               <div className="w-1/4 h-6 bg-green-800 border border-white/20"></div>
           </div>
      </div>

      {/* --- BATTLE FIELD (Floor) --- */}
      {/* Using a generic stadium floor - dirt/grass mix */}
      <div className="absolute bottom-0 w-full h-[35%] bg-[#5d7d48] border-t-4 border-[#a3c191]">
          {/* Field Markings */}
          <div className="absolute top-[50%] left-[10%] w-[80%] h-[40%] border-4 border-white/30 rounded-[50%] transform scale-y-50"></div>
          <div className="absolute top-[50%] left-0 w-full h-1 bg-white/20"></div>
          
          {/* Texture Noise */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)' }}></div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none mix-blend-multiply" />
    </div>
  );
};

export default BattleBackground;
