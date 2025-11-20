import React from 'react';
import { PokemonAnimationState } from '../types';

interface PokemonSpriteProps {
  src: string;
  alt: string;
  isBack?: boolean;
  animationState: PokemonAnimationState;
  isMega?: boolean;
  height?: number; // Height in decimeters
}

const PokemonSprite: React.FC<PokemonSpriteProps> = ({ src, alt, isBack, animationState, isMega, height = 10 }) => {
  let animClass = "transition-all duration-300";
  
  if (animationState === 'attacking') {
    animClass += isBack ? " animate-lunge-p" : " animate-lunge-e";
  } else if (animationState === 'hit') {
    animClass += " animate-flash animate-shake";
  } else if (animationState === 'faint') {
    animClass += " animate-faint";
  } else if (animationState === 'mega') {
    animClass += " animate-mega";
  } else if (animationState === 'mega-entry') {
    animClass += " animate-mega-appear";
  } else if (animationState === 'recall') {
    animClass += isBack ? " animate-recall-p" : " animate-recall-e";
  } else if (animationState === 'release') {
    animClass += isBack ? " animate-release-p" : " animate-release-e";
  } else if (animationState === 'capture') {
    animClass += " animate-capture";
  } else {
    animClass += " animate-bounce-slight"; 
  }

  // LOGARITHMIC SCALING - WORLD SCALE (Reverted to Moderate Size)
  // Base size: 100px + log2(height) * 35px
  // Pikachu (4dm) -> 100 + 2*35 = 170px
  // Charizard (17dm) -> 100 + 4.08*35 = 242px
  // Wailord (145dm) -> 100 + 7.1*35 = 348px
  
  const scaleFactor = isMega ? 1.2 : 1; // Mega is 20% larger than base form
  
  // Calculate dynamic size based on height
  const sizeVal = (100 + (Math.log2(height || 10) * 35)) * scaleFactor;
  
  // Clamp size to ensure usability on all screens
  const finalSize = Math.min(Math.max(sizeVal, 140), 450); 

  const containerStyle = {
      width: `${finalSize}px`,
      height: `${finalSize}px`,
  };

  const shadowSizeClass = isMega
    ? "w-[80%] h-[20%] -mt-8 opacity-40"
    : "w-[60%] h-[15%] -mt-4 opacity-30";

  return (
    <div 
        className={`relative flex items-end justify-center transition-all duration-500 ease-out z-10`}
        style={containerStyle}
    >
        {/* Shadow (only visible if not recalled) */}
        {(animationState !== 'recall' && animationState !== 'capture' && animationState !== 'faint') && (
            <div className={`absolute bottom-[10%] bg-black rounded-[50%] blur-md transform scale-y-50 transition-all duration-500 ${shadowSizeClass}`} />
        )}
        
        <img 
          src={src} 
          alt={alt} 
          className={`object-contain w-full h-full pixelated filter drop-shadow-2xl ${animClass}`}
          style={{ imageRendering: 'pixelated' }}
        />
    </div>
  );
};

export default PokemonSprite;