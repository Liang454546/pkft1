import React, { useEffect, useState } from 'react';
import { Move, Pokemon, BattlePhase } from '../types';
import { TYPE_COLORS, TYPE_NAMES_ZH, TYPE_CHART } from '../constants';
import { Swords, Backpack, Repeat, LogOut, Zap } from 'lucide-react';

interface BattleDialogProps {
  text: string;
  onTextComplete: () => void;
  phase: BattlePhase;
  activePokemon: Pokemon;
  enemyPokemon: Pokemon;
  onMoveSelect: (move: Move) => void;
  onSwitchSelect: () => void;
  team: Pokemon[];
  onSwitchPokemon: (index: number) => void;
  onBagClick: () => void;
  onBack: () => void;
  megaPending: boolean;
  onToggleMega: () => void;
}

const BattleDialog: React.FC<BattleDialogProps> = ({ 
  text, 
  onTextComplete, 
  phase, 
  activePokemon, 
  enemyPokemon,
  onMoveSelect, 
  onSwitchSelect,
  team,
  onSwitchPokemon,
  onBagClick,
  onBack,
  megaPending,
  onToggleMega
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFullTextDisplayed, setIsFullTextDisplayed] = useState(false);

  // Typewriter effect
  useEffect(() => {
    // Reset text on specific phases
    if (![BattlePhase.TextProcessing, BattlePhase.Start, BattlePhase.Victory, BattlePhase.Defeat, BattlePhase.AttackAnimation].includes(phase)) return;
    
    setDisplayedText('');
    setIsFullTextDisplayed(false);
    let i = 0;
    const speed = 20; 

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsFullTextDisplayed(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, phase]);

  const handleDialogClick = () => {
    if (isFullTextDisplayed && (phase === BattlePhase.TextProcessing || phase === BattlePhase.Start)) {
      onTextComplete();
    }
  };

  const getTypeEffectiveness = (moveType: string) => {
      if (!enemyPokemon) return 1;
      let multiplier = 1;
      enemyPokemon.types.forEach(defType => {
          const eff = TYPE_CHART[moveType]?.[defType];
          if (eff !== undefined) multiplier *= eff;
      });
      return multiplier;
  };

  // --- MENU PHASE ---
  if (phase === BattlePhase.Menu) {
    return (
      <div className="h-full w-full bg-slate-900 rounded-lg border-4 border-slate-600 shadow-inner flex overflow-hidden font-['Noto_Sans_TC']">
        <div className="hidden md:flex w-1/3 flex-col justify-center p-6 bg-slate-800 text-white border-r-4 border-slate-700 relative">
          <p className="text-slate-400 text-sm mb-1 font-bold">戰鬥中</p>
          <p className="text-2xl font-black tracking-widest truncate">{activePokemon.name}</p>
          <p className="text-slate-500 text-xs mt-2">要做什麼?</p>
        </div>
        
        <div className="flex-1 grid grid-cols-2 bg-slate-200">
          <button 
            onClick={() => onMoveSelect(activePokemon.moves[0])} 
            className="group bg-white hover:bg-red-50 border-b-4 border-r-4 border-slate-300 hover:border-red-400 flex flex-col items-center justify-center transition-all active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1"
          >
            <Swords className="w-8 h-8 mb-1 text-slate-700 group-hover:text-red-500" />
            <span className="text-lg font-black text-slate-800 group-hover:text-red-600">戰鬥</span>
          </button>
          
          <button 
             onClick={onBagClick}
             className="group bg-white hover:bg-yellow-50 border-b-4 border-slate-300 hover:border-yellow-400 flex flex-col items-center justify-center transition-all active:border-b-0 active:translate-y-1 active:translate-x-1"
          >
            <Backpack className="w-8 h-8 mb-1 text-slate-700 group-hover:text-yellow-500" />
            <span className="text-lg font-black text-slate-800 group-hover:text-yellow-600">背包</span>
          </button>

          <button 
             onClick={onSwitchSelect}
             className="group bg-white hover:bg-green-50 border-r-4 border-slate-300 hover:border-green-400 flex flex-col items-center justify-center transition-all active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1"
          >
            <Repeat className="w-8 h-8 mb-1 text-slate-700 group-hover:text-green-500" />
            <span className="text-lg font-black text-slate-800 group-hover:text-green-600">精靈</span>
          </button>

          <button className="group bg-white cursor-not-allowed flex flex-col items-center justify-center grayscale opacity-60">
             <LogOut className="w-8 h-8 mb-1 text-slate-400" />
             <span className="text-lg font-black text-slate-400">逃跑</span>
          </button>
        </div>
      </div>
    );
  }

  // --- MOVE SELECTION PHASE ---
  if (phase === BattlePhase.MoveSelection) {
    return (
      <div className="h-full w-full bg-slate-800 border-4 border-slate-600 rounded-lg flex flex-row shadow-2xl relative overflow-hidden font-['Noto_Sans_TC']">
        <div className="w-[100px] bg-slate-900 border-r border-slate-700 flex flex-col justify-between p-2">
            <button onClick={onBack} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-3 rounded border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all font-bold">◀ 返回</button>

            {activePokemon.canMegaEvolve && !activePokemon.isMega && (
                 <button 
                    onClick={onToggleMega}
                    className={`w-full flex flex-col items-center justify-center p-2 rounded transition-all duration-300 border-2 ${megaPending ? 'bg-gradient-to-br from-pink-900 to-purple-900 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-slate-800 border-slate-600 text-gray-500 hover:bg-slate-700'}`}
                 >
                    <Zap className={`w-6 h-6 mb-1 ${megaPending ? 'text-yellow-300 fill-yellow-300' : 'text-gray-500'}`} />
                    <span className={`text-[10px] font-black ${megaPending ? 'text-white' : 'text-gray-400'}`}>MEGA</span>
                 </button>
             )}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2 p-2 bg-slate-200">
          {activePokemon.moves.map((move, idx) => {
            const effectiveness = getTypeEffectiveness(move.type);
            let effTag = null;
            if (effectiveness > 1) effTag = <span className="text-[9px] bg-red-500 text-white px-1 rounded absolute top-1 right-1">效果絕佳</span>;
            if (effectiveness < 1 && effectiveness > 0) effTag = <span className="text-[9px] bg-gray-400 text-white px-1 rounded absolute top-1 right-1">效果不佳</span>;
            
            return (
                <button 
                  key={idx} 
                  onClick={() => onMoveSelect(move)}
                  className="relative bg-white border-2 border-slate-300 hover:border-red-500 hover:bg-red-50 rounded-lg px-2 py-1 text-left transition-all group shadow-sm active:scale-[0.98] flex flex-col justify-center h-full"
                >
                  {effTag}
                  <div className="flex justify-between items-center w-full mb-1 mt-1">
                      <span className="font-black text-slate-800 text-sm leading-tight">{move.name}</span>
                      <span 
                        className="text-[10px] px-1.5 py-0.5 rounded text-white font-bold min-w-[36px] text-center"
                        style={{ backgroundColor: TYPE_COLORS[move.type] }}
                      >
                        {TYPE_NAMES_ZH[move.type]}
                      </span>
                  </div>
                  <div className="flex justify-between items-center w-full text-[10px] font-mono text-slate-500 font-bold">
                      <span className="bg-slate-100 px-1 rounded">威力 {move.power || '--'}</span>
                      <span className={move.pp < 5 ? "text-red-500" : ""}>PP {move.pp}/{move.maxPp}</span>
                  </div>
                </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- SWITCH / BAG PHASE ---
  if (phase === BattlePhase.Switch) {
    return (
        <div className="h-full w-full bg-slate-800 border-4 border-slate-600 rounded-lg flex flex-col p-2 shadow-2xl text-white font-['Noto_Sans_TC']">
          <div className="flex justify-between items-center mb-2 px-1">
              <div className="text-sm font-bold text-gray-300">選擇要交換的寶可夢</div>
              <button onClick={onBack} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white border border-slate-500">取消</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto pr-1 h-full">
              {team.map((p, idx) => (
                  <button 
                    key={p.id + idx}
                    disabled={p.isFainted || p.id === activePokemon.id}
                    onClick={() => onSwitchPokemon(idx)}
                    className={`
                        flex flex-col items-center p-1 border-2 rounded-lg transition-all
                        ${p.isFainted ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-slate-700 border-slate-500 hover:bg-slate-600 hover:border-blue-400'} 
                        ${p.id === activePokemon.id ? 'border-green-500 bg-slate-800 ring-1 ring-green-500' : ''}
                    `}
                  >
                      <div className="w-8 h-8 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center overflow-hidden relative mb-1">
                         <img src={p.sprites.front} className="w-[140%] h-[140%] object-contain absolute -bottom-1" alt="icon"/>
                      </div>
                      <div className="text-xs font-bold truncate w-full text-center">{p.name}</div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-600 mt-1">
                          <div className={`h-full ${p.currentHp < p.maxHp/3 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(p.currentHp / p.maxHp) * 100}%`}}></div>
                      </div>
                  </button>
              ))}
          </div>
        </div>
    )
  }

  // --- DEFAULT / DIALOG PHASE ---
  return (
    <div 
        onClick={handleDialogClick}
        className="h-full w-full bg-[#222] border-4 border-slate-500 rounded-lg p-4 relative shadow-2xl cursor-pointer flex items-start font-['Noto_Sans_TC']"
    >
      <div className="flex-1 border-l-4 border-slate-600 pl-4 h-full flex items-center">
        <p className="text-white text-lg md:text-xl font-bold tracking-wide leading-relaxed drop-shadow-md">
            {displayedText}
            {isFullTextDisplayed && (phase === BattlePhase.TextProcessing || phase === BattlePhase.Start) && (
                <span className="animate-bounce inline-block ml-2 text-red-500 text-xl">▼</span>
            )}
        </p>
      </div>

      {(phase === BattlePhase.Victory || phase === BattlePhase.Defeat) && isFullTextDisplayed && (
           <button onClick={() => window.location.reload()} className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded border-b-4 border-blue-800 active:border-0 active:translate-y-1 font-bold shadow-lg animate-pulse">
               再來一局
           </button>
      )}
    </div>
  );
};

export default BattleDialog;
