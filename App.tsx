import React, { useEffect, useState, useCallback } from 'react';
import { BattlePhase, BattleState, Pokemon, Move, TypeName, PokemonAnimationState, TrainerAnimationState } from './types';
import { fetchRandomPokemon, fetchMegaData, fetchMegaCapableTeam } from './services/pokeService';
import { ENEMY_TRAINER_SPRITE, TYPE_CHART, PLAYER_TRAINER_SPRITE } from './constants';
import HealthBar from './components/HealthBar';
import PokemonSprite from './components/PokemonSprite';
import TrainerSprite from './components/TrainerSprite';
import BattleDialog from './components/BattleDialog';
import BattleBackground from './components/BattleBackground';
import MegaEvolutionCutscene from './components/MegaEvolutionCutscene';

const calculateDamage = (attacker: Pokemon, defender: Pokemon, move: Move): number => {
  const level = 50;
  const a = move.damageClass === 'physical' ? attacker.stats.attack : attacker.stats.spAttack;
  const d = move.damageClass === 'physical' ? defender.stats.defense : defender.stats.spDefense;
  const base = Math.floor((Math.floor((2 * level) / 5 + 2) * move.power * a / d) / 50) + 2;
  
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const random = (Math.floor(Math.random() * 16) + 85) / 100;
  
  let typeMult = 1;
  defender.types.forEach(defType => {
      const eff = TYPE_CHART[move.type]?.[defType];
      if (eff !== undefined) typeMult *= eff;
  });

  return Math.floor(base * stab * random * typeMult);
};

const App: React.FC = () => {
  const [battleState, setBattleState] = useState<BattleState>({
    phase: BattlePhase.Start,
    playerTeam: [],
    enemyTeam: [],
    activePlayerIndex: 0,
    activeEnemyIndex: 0,
    dialogQueue: ["載入對戰資料中..."],
    currentDialog: "請稍候...",
    turn: 0,
    megaPending: false
  });

  const [animState, setAnimState] = useState<{
    player: PokemonAnimationState,
    enemy: PokemonAnimationState,
    trainerPlayer: TrainerAnimationState,
    trainerEnemy: TrainerAnimationState
  }>({ 
    player: 'idle', enemy: 'idle', 
    trainerPlayer: 'idle', trainerEnemy: 'idle' 
  });

  const [activeMoveType, setActiveMoveType] = useState<TypeName | undefined>(undefined);
  
  // Mega State: stores info about who is evolving to render cutscene
  const [megaEvolvingInfo, setMegaEvolvingInfo] = useState<{
      isPlayer: boolean;
      type: TypeName;
      spriteUrl: string;
  } | null>(null);

  const [showTrainers, setShowTrainers] = useState(true); // Trainers only show at intro
  const [trainersExiting, setTrainersExiting] = useState(false);

  // Loading
  useEffect(() => {
    const initGame = async () => {
      try {
        const [pTeam, eTeam] = await Promise.all([
            fetchMegaCapableTeam(6), 
            fetchMegaCapableTeam(6) // Enemy also gets cool Megas
        ]);
        
        setBattleState(prev => ({
          ...prev,
          playerTeam: pTeam,
          enemyTeam: eTeam,
          dialogQueue: [`寶可夢訓練家 N 想要戰鬥!`, `寶可夢訓練家 N 派出了 ${eTeam[0].name}!`, `去吧! ${pTeam[0].name}!`],
          currentDialog: "",
          phase: BattlePhase.Start,
          megaPending: false
        }));
      } catch (error) {
        console.error("Failed to load pokemon", error);
      }
    };
    initGame();
  }, []);

  const activePlayer = battleState.playerTeam[battleState.activePlayerIndex];
  const activeEnemy = battleState.enemyTeam[battleState.activeEnemyIndex];

  // Dialog Processor
  const processQueue = useCallback(() => {
    if (battleState.dialogQueue.length > 0) {
      const nextMsg = battleState.dialogQueue[0];
      
      // Trigger trainer exit after intro dialogs
      if (battleState.dialogQueue.length === 1 && showTrainers && !trainersExiting) {
           setTrainersExiting(true);
           setAnimState(prev => ({ ...prev, trainerPlayer: 'throw', trainerEnemy: 'command' }));
           // After throw animation, hide them
           setTimeout(() => setShowTrainers(false), 1000);
      }

      setBattleState(prev => ({
        ...prev,
        currentDialog: nextMsg,
        dialogQueue: prev.dialogQueue.slice(1),
        phase: BattlePhase.TextProcessing
      }));
    } else {
      // Check Faints / Next Steps
      const playerFainted = activePlayer?.isFainted;
      const enemyFainted = activeEnemy?.isFainted;

      if (playerFainted) {
         if (battleState.playerTeam.every(p => p.isFainted)) {
             setBattleState(prev => ({ ...prev, phase: BattlePhase.Defeat, currentDialog: "眼前一片漆黑..." }));
             return;
         }
         setBattleState(prev => ({ ...prev, phase: BattlePhase.Switch, currentDialog: "請選擇下一隻寶可夢。" }));
      } else if (enemyFainted) {
          const nextIdx = battleState.enemyTeam.findIndex(p => !p.isFainted);
          if (nextIdx === -1) {
             setBattleState(prev => ({ ...prev, phase: BattlePhase.Victory, currentDialog: "恭喜! 你贏得了勝利!" }));
          } else {
             if (battleState.activeEnemyIndex !== nextIdx) {
                 setBattleState(prev => ({ 
                     ...prev, 
                     activeEnemyIndex: nextIdx,
                     phase: BattlePhase.Start,
                     dialogQueue: [`對手派出了 ${prev.enemyTeam[nextIdx].name}!`]
                 }));
                 setAnimState(prev => ({ ...prev, enemy: 'release' }));
                 setTimeout(() => setAnimState(prev => ({ ...prev, enemy: 'idle' })), 1000);
             }
          }
      } else {
        setBattleState(prev => ({ ...prev, phase: BattlePhase.Menu }));
      }
    }
  }, [battleState.dialogQueue, activePlayer, activeEnemy, battleState.playerTeam, battleState.enemyTeam, showTrainers, trainersExiting]);

  // --- CINEMATIC SWITCH ---
  const performCinematicSwitch = async (newIndex: number) => {
      setBattleState(prev => ({ ...prev, phase: BattlePhase.AttackAnimation, currentDialog: `回來吧, ${activePlayer.name}!` }));
      setAnimState(prev => ({ ...prev, player: 'recall' }));
      
      await new Promise(r => setTimeout(r, 1000));

      setBattleState(prev => ({ 
          ...prev, 
          activePlayerIndex: newIndex,
          megaPending: false,
          currentDialog: `去吧! ${prev.playerTeam[newIndex].name}!`
      }));
      
      setAnimState(prev => ({ ...prev, player: 'release' }));
      
      await new Promise(r => setTimeout(r, 1200));
      setAnimState(prev => ({ ...prev, player: 'idle' }));

      processQueue();
  }

  const handleSwitch = (index: number) => {
      performCinematicSwitch(index);
  };

  // --- CATCHING ---
  const handleCatch = async () => {
      if (!activeEnemy) return;
      setBattleState(prev => ({ ...prev, phase: BattlePhase.AttackAnimation, currentDialog: "去吧! 精靈球!" }));
      // Note: Trainers are hidden, so ball originates from off-screen left
      await new Promise(r => setTimeout(r, 800));
      setAnimState(prev => ({ ...prev, enemy: 'capture' }));
      
      await new Promise(r => setTimeout(r, 2000));

      const catchRate = activeEnemy.currentHp < activeEnemy.maxHp * 0.2;
      
      if (catchRate) {
          setBattleState(prev => ({ 
              ...prev, 
              enemyTeam: prev.enemyTeam.map((p, i) => i === prev.activeEnemyIndex ? { ...p, isFainted: true } : p),
              currentDialog: `收服了 ${activeEnemy.name}!`
          }));
          processQueue();
      } else {
          setBattleState(prev => ({ ...prev, currentDialog: "可惡! 沒抓到!" }));
          setAnimState(prev => ({ ...prev, enemy: 'idle' }));
          await new Promise(r => setTimeout(r, 1000));
          processQueue();
      }
  }

  // --- MEGA EVOLUTION SEQUENCE (Revised 2.4s) ---
  const handleMegaEvolution = async (isPlayer: boolean) => {
      const target = isPlayer ? battleState.playerTeam[battleState.activePlayerIndex] : battleState.enemyTeam[battleState.activeEnemyIndex];
      
      setBattleState(prev => ({ ...prev, currentDialog: `...!?`, megaPending: false }));
      
      // 1. Set Cutscene Props (triggers overlay)
      setMegaEvolvingInfo({
          isPlayer,
          type: target.types[0],
          spriteUrl: isPlayer ? target.sprites.back : target.sprites.front
      });
      
      // 2. Fetch Mega Data in background
      const megaData = await fetchMegaData(target);

      // 3. Wait 1.2s (Phase 1 & 2: Activation + Encasement)
      await new Promise(r => setTimeout(r, 1200));

      // 4. BURST MOMENT (1.2s): Swap Data
      setBattleState(prev => {
          const team = isPlayer ? [...prev.playerTeam] : [...prev.enemyTeam];
          const index = isPlayer ? prev.activePlayerIndex : prev.activeEnemyIndex;
          team[index] = megaData;
          return isPlayer 
              ? { ...prev, playerTeam: team, currentDialog: `Mega 進化成功!` } 
              : { ...prev, enemyTeam: team, currentDialog: `對手 Mega 進化了!` };
      });
      
      // 5. Wait remaining 1.2s (Phase 3 & 4: Burst + Residual)
      await new Promise(r => setTimeout(r, 1200));

      // 6. End Cutscene
      setMegaEvolvingInfo(null);

      return megaData; 
  };

  const executeTurn = async (playerMove: Move) => {
    setBattleState(prev => ({ ...prev, phase: BattlePhase.AttackAnimation }));

    let currentPlayer = battleState.playerTeam[battleState.activePlayerIndex]; 
    let currentEnemy = battleState.enemyTeam[battleState.activeEnemyIndex];

    // 1. CHECK PLAYER MEGA
    if (battleState.megaPending && currentPlayer.canMegaEvolve && !currentPlayer.isMega) {
         currentPlayer = await handleMegaEvolution(true);
    }

    // 2. CHECK ENEMY MEGA (AI)
    // 50% chance to mega if capable and not already mega
    if (!currentEnemy.isMega && currentEnemy.canMegaEvolve && Math.random() > 0.3) {
         currentEnemy = await handleMegaEvolution(false);
    }

    // ATTACK LOGIC
    const playerSpeed = currentPlayer.stats.speed;
    const enemySpeed = currentEnemy.stats.speed;
    const isPlayerFirst = playerSpeed >= enemySpeed; 
    const enemyMove = currentEnemy.moves[Math.floor(Math.random() * currentEnemy.moves.length)];

    const createAttackStep = (attacker: Pokemon, defender: Pokemon, move: Move, isPlayer: boolean) => async () => {
      if (attacker.isFainted) return;

      setAnimState(prev => ({ ...prev, [isPlayer ? 'player' : 'enemy']: 'attacking' }));
      setActiveMoveType(move.type);
      
      setBattleState(prev => ({ ...prev, currentDialog: `${attacker.name} 使用了 ${move.name}!`, phase: BattlePhase.TextProcessing }));
      await new Promise(r => setTimeout(r, 800)); 

      const damage = calculateDamage(attacker, defender, move);
      setAnimState(prev => ({ ...prev, 
          [isPlayer ? 'player' : 'enemy']: 'idle',
          [isPlayer ? 'enemy' : 'player']: 'hit'
      }));
      
      setBattleState(prev => {
        const teams = isPlayer ? [...prev.enemyTeam] : [...prev.playerTeam];
        const idx = isPlayer ? prev.activeEnemyIndex : prev.activePlayerIndex;
        const target = teams[idx];
        target.currentHp = Math.max(0, target.currentHp - damage);
        if (target.currentHp === 0) target.isFainted = true;
        return isPlayer ? { ...prev, enemyTeam: teams } : { ...prev, playerTeam: teams };
      });
      
      await new Promise(r => setTimeout(r, 600)); 
      setAnimState(prev => ({ ...prev, [isPlayer ? 'enemy' : 'player']: 'idle' }));
      setActiveMoveType(undefined);
    };

    if (isPlayerFirst) {
        await createAttackStep(currentPlayer, currentEnemy, playerMove, true)();
        // Refresh ref in case p1 killed p2
        if (!battleState.enemyTeam[battleState.activeEnemyIndex].isFainted) {
             await createAttackStep(currentEnemy, currentPlayer, enemyMove, false)();
        }
    } else {
        await createAttackStep(currentEnemy, currentPlayer, enemyMove, false)();
        if (!battleState.playerTeam[battleState.activePlayerIndex].isFainted) {
            await createAttackStep(currentPlayer, currentEnemy, playerMove, true)();
        }
    }

    processQueue();
  };

  if (!activePlayer || !activeEnemy) return <div className="bg-black h-screen text-white flex items-center justify-center">LOADING BATTLE...</div>;

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 font-sans overflow-hidden">
      <div className="relative w-full h-full max-w-5xl md:aspect-video md:h-auto md:rounded-xl overflow-hidden shadow-2xl flex flex-col border-0 md:border-8 border-slate-800">
        
        <BattleBackground activeMoveType={activeMoveType} />
        
        {/* NEW CUTSCENE INTEGRATION */}
        {megaEvolvingInfo && (
            <MegaEvolutionCutscene 
                isPlayer={megaEvolvingInfo.isPlayer} 
                pokemonName={megaEvolvingInfo.isPlayer ? activePlayer.name : activeEnemy.name}
                type={megaEvolvingInfo.type}
                spriteUrl={megaEvolvingInfo.spriteUrl}
            />
        )}

        {/* --- ARENA LAYOUT --- */}
        <div className="flex-1 relative overflow-hidden">
            
            {/* ENEMY HUD */}
            <div className="absolute top-4 left-4 z-20 w-[200px] animate-slide-in-right">
                <div className="bg-black/40 backdrop-blur-sm h-6 rounded-t-lg w-[90%] ml-2"></div>
                <div className="bg-[#f8f8f8] border-b-4 border-r-4 border-gray-600 p-2 rounded-br-xl shadow-lg">
                    <div className="flex justify-between items-baseline mb-1 px-1">
                        <span className="font-bold text-sm text-gray-800 truncate">{activeEnemy.name}</span>
                        <span className="text-xs font-bold text-gray-600">Lv.50</span>
                    </div>
                    <HealthBar current={activeEnemy.currentHp} max={activeEnemy.maxHp} />
                </div>
            </div>

            {/* ENEMY SIDE */}
            <div className="absolute top-[12%] right-[14%] z-10 flex items-end">
                <div className="relative z-10 origin-bottom transform">
                    <PokemonSprite 
                        src={activeEnemy.sprites.front} 
                        alt={activeEnemy.name} 
                        animationState={animState.enemy}
                        isMega={activeEnemy.isMega}
                        height={(activeEnemy as any).height} // Pass height for scale
                    />
                </div>
                {showTrainers && (
                    <div className="absolute right-[-50px] bottom-0 z-20">
                         <TrainerSprite 
                            src={ENEMY_TRAINER_SPRITE} 
                            animationState={animState.trainerEnemy} 
                            shouldExit={trainersExiting}
                         />
                    </div>
                )}
            </div>

            {/* PLAYER SIDE */}
            <div className="absolute bottom-[8%] left-[10%] z-10 flex items-end">
                {showTrainers && (
                    <div className="absolute left-[-50px] bottom-0 z-20">
                        <TrainerSprite 
                            src={PLAYER_TRAINER_SPRITE} 
                            animationState={animState.trainerPlayer} 
                            isPlayer 
                            shouldExit={trainersExiting}
                        />
                    </div>
                )}
                <div className="relative z-10 origin-bottom transform">
                     <PokemonSprite 
                        src={activePlayer.sprites.back} 
                        alt={activePlayer.name} 
                        isBack={true}
                        animationState={animState.player}
                        isMega={activePlayer.isMega}
                        height={(activePlayer as any).height} // Pass height for scale
                    />
                </div>
            </div>

            {/* PLAYER HUD */}
            <div className="absolute bottom-[10%] right-4 z-20 w-[220px]">
                <div className="bg-black/40 backdrop-blur-sm h-6 rounded-t-lg w-[90%] ml-auto mr-2"></div>
                <div className="bg-[#f8f8f8] border-b-4 border-r-4 border-gray-600 p-3 rounded-tl-xl shadow-lg">
                    <div className="flex justify-between items-baseline mb-1 px-1">
                        <span className="font-bold text-sm text-gray-800 flex items-center gap-1 truncate">
                            {activePlayer.name}
                            {activePlayer.isMega && <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] px-1 rounded italic animate-pulse">MEGA</span>}
                        </span>
                        <span className="text-xs font-bold text-gray-600">Lv.50</span>
                    </div>
                    <HealthBar current={activePlayer.currentHp} max={activePlayer.maxHp} label="HP" />
                    <div className="mt-1 text-right text-[10px] text-gray-500 font-mono font-bold">{activePlayer.currentHp}/{activePlayer.maxHp}</div>
                </div>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="h-[180px] bg-gray-800 p-2 md:p-4 border-t-4 border-gray-600 z-30 shrink-0 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
           <BattleDialog 
              text={battleState.currentDialog} 
              phase={battleState.phase}
              onTextComplete={() => processQueue()}
              activePokemon={activePlayer}
              enemyPokemon={activeEnemy}
              onMoveSelect={(move) => {
                  if(battleState.phase === BattlePhase.Menu) setBattleState(prev => ({ ...prev, phase: BattlePhase.MoveSelection }));
                  else executeTurn(move);
              }}
              onSwitchSelect={() => setBattleState(prev => ({ ...prev, phase: BattlePhase.Switch }))}
              onBagClick={handleCatch}
              team={battleState.playerTeam}
              onSwitchPokemon={handleSwitch}
              onBack={() => setBattleState(prev => ({ ...prev, phase: BattlePhase.Menu, megaPending: false }))}
              megaPending={battleState.megaPending}
              onToggleMega={() => setBattleState(prev => ({ ...prev, megaPending: !prev.megaPending }))}
           />
        </div>
      </div>
    </div>
  );
};

export default App;