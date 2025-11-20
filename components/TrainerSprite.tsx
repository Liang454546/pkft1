import React from 'react';
import { TrainerAnimationState } from '../types';

interface TrainerSpriteProps {
  src: string;
  animationState: TrainerAnimationState;
  isPlayer?: boolean;
  shouldExit?: boolean; // Trigger to leave the stage
}

const TrainerSprite: React.FC<TrainerSpriteProps> = ({ src, animationState, isPlayer, shouldExit }) => {
  let animClass = "transition-transform duration-300";

  if (shouldExit) {
      animClass += isPlayer ? " animate-slide-out-left" : " animate-slide-out-right";
  } else {
      switch (animationState) {
          case 'command':
              animClass += " animate-command";
              break;
          case 'cheer':
              animClass += " animate-cheer";
              break;
          case 'shock':
              animClass += " animate-shake";
              break;
          default:
              break;
      }
  }

  // Flip player to face right
  const flipClass = isPlayer ? "scale-x-[-1]" : "";

  return (
    <div className={`relative w-32 h-32 md:w-48 md:h-48 flex items-end justify-center ${animClass}`}>
        <img 
          src={src} 
          alt="Trainer" 
          className={`object-contain w-full h-full pixelated drop-shadow-xl ${flipClass}`}
        />
    </div>
  );
};

export default TrainerSprite;