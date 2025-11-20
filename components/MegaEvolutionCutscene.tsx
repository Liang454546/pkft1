import React, { useEffect, useState } from 'react';
import { TypeName } from '../types';
import { TYPE_COLORS } from '../constants';

interface MegaEvolutionCutsceneProps {
  isPlayer: boolean;
  pokemonName: string;
  type: TypeName;
  spriteUrl: string;
}

const MegaEvolutionCutscene: React.FC<MegaEvolutionCutsceneProps> = ({ isPlayer, pokemonName, type, spriteUrl }) => {
  const [stage, setStage] = useState(0);
  
  // Animation Phases:
  // 0 - 0.4s:  Activation (Beam + Hexagon)
  // 0.4 - 1.2s: Encasement (Sphere + Obscure)
  // 1.2 - 1.8s: Burst (Explosion + Flash + Logo) - Logo fades quickly here
  // 1.8 - 2.4s: Residual (Aura + Particles)

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 10); // Start immediately
    const timer2 = setTimeout(() => setStage(2), 400); // Encasement
    const timer3 = setTimeout(() => setStage(3), 1200); // Burst
    
    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
    };
  }, []);

  const color = TYPE_COLORS[type] || '#ffffff';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-camera-push overflow-hidden bg-black/60 backdrop-blur-[2px]">
      
      {/* --- PHASE 1: ACTIVATION (0 - 0.4s) --- */}
      {/* Hexagon on Floor */}
      {stage >= 1 && stage < 3 && (
         <div className="absolute bottom-[10%] w-[300px] h-[150px] animate-hex-spin origin-center opacity-0">
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                 <polygon points="50 5, 95 27, 95 73, 50 95, 5 73, 5 27" 
                          fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 2" />
                 <polygon points="50 15, 85 32, 85 68, 50 85, 15 68, 15 32" 
                          fill={color} opacity="0.3" />
             </svg>
         </div>
      )}

      {/* Energy Beam */}
      {stage === 1 && (
          <div className="absolute w-8 h-[200vh] bg-white opacity-0 animate-beam-enter origin-bottom"
               style={{ 
                   transformOrigin: isPlayer ? 'bottom left' : 'top right',
                   background: `linear-gradient(to top, white, ${color})`,
                   left: isPlayer ? '20%' : 'auto',
                   right: isPlayer ? 'auto' : '20%',
                   top: isPlayer ? 'auto' : '-50%',
                   bottom: isPlayer ? '-50%' : 'auto',
                   transform: isPlayer ? 'rotate(30deg)' : 'rotate(-30deg)'
               }} 
          />
      )}

      {/* --- CENTER STAGE SPRITE (Hidden during burst, shown otherwise) --- */}
      {/* We render a duplicate of the sprite here to control the effects perfectly */}
      <div className={`relative z-10 transition-all duration-100 ${stage === 3 ? 'animate-shake-hard' : ''}`}>
          <img 
             src={spriteUrl} 
             alt="mega-target" 
             className={`w-48 h-48 md:w-64 md:h-64 object-contain pixelated transition-all duration-300
                         ${stage === 2 ? 'brightness-0 invert drop-shadow-[0_0_10px_white]' : ''}
                         ${stage >= 3 ? 'opacity-0' : 'opacity-100'}
             `}
          />
          
          {/* --- PHASE 2: ENCASEMENT (0.4 - 1.2s) --- */}
          {/* Light Sphere */}
          {stage === 2 && (
             <div className="absolute inset-0 -m-10 rounded-full animate-sphere-pulse mix-blend-screen"
                  style={{ background: `radial-gradient(circle, white 30%, ${color} 70%, transparent 100%)` }} />
          )}
      </div>

      {/* --- PHASE 3: BURST & REVEAL (1.2 - 1.8s) --- */}
      {stage === 3 && (
          <>
            {/* Whiteout Flash */}
            <div className="absolute inset-0 bg-white animate-flash-white z-50 pointer-events-none"></div>

            {/* Explosion Ring */}
            <div className="absolute w-[100px] h-[100px] rounded-full border-[50px] border-white animate-burst-expand z-20 box-content"
                 style={{ borderColor: color }} />
            
            {/* DNA / Mega Symbol Overlay - Accurate Helix Design */}
            <div className="absolute top-[20%] z-50 animate-zoom-fade">
                 <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                    <defs>
                        <linearGradient id="megaRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4ade80" /> 
                            <stop offset="33%" stopColor="#22d3ee" /> 
                            <stop offset="66%" stopColor="#a855f7" /> 
                            <stop offset="100%" stopColor="#f472b6" />
                        </linearGradient>
                        <radialGradient id="sphereHighlight" cx="30%" cy="30%" r="70%">
                             <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                             <stop offset="20%" stopColor="rgba(255,255,255,0.2)" />
                             <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>
                    
                    {/* Rainbow Orb */}
                    <circle cx="100" cy="100" r="95" fill="url(#megaRainbow)" />
                    <circle cx="100" cy="100" r="95" fill="url(#sphereHighlight)" />
                    
                    {/* The Black Helix DNA Shape */}
                    {/* This path draws the stylized 'S' / Helix shape seen in official artwork */}
                    <path d="
                        M 110 20 
                        C 160 30, 170 90, 140 130
                        C 120 155, 90 180, 70 180 
                        L 60 180 
                        C 80 170, 110 140, 125 115
                        C 145 85, 135 40, 100 30
                        Z
                        
                        M 90 180
                        C 40 170, 30 110, 60 70
                        C 80 45, 110 20, 130 20
                        L 140 20
                        C 120 30, 90 60, 75 85
                        C 55 115, 65 160, 100 170
                        Z
                    " fill="#1a1a1a" />
                    
                    {/* The Cuts/Stripes through the DNA */}
                    <path d="
                       M 65 75 L 135 55
                       M 60 100 L 140 80
                       M 55 125 L 145 105
                    " stroke="url(#megaRainbow)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />

                 </svg>
            </div>
          </>
      )}

      {/* --- PHASE 4: RESIDUAL (1.8 - 2.4s) --- */}
      {stage >= 3 && (
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {/* Floating Particles */}
             {[...Array(10)].map((_, i) => (
                 <div key={i} 
                      className="absolute w-2 h-2 rounded-full bg-white animate-float-up"
                      style={{ 
                          left: `${40 + Math.random() * 20}%`, 
                          top: '60%',
                          backgroundColor: color,
                          animationDelay: `${Math.random() * 0.5}s`
                      }} 
                 />
             ))}
         </div>
      )}

    </div>
  );
};

export default MegaEvolutionCutscene;