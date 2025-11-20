export enum TypeName {
  Normal = 'normal',
  Fire = 'fire',
  Water = 'water',
  Grass = 'grass',
  Electric = 'electric',
  Ice = 'ice',
  Fighting = 'fighting',
  Poison = 'poison',
  Ground = 'ground',
  Flying = 'flying',
  Psychic = 'psychic',
  Bug = 'bug',
  Rock = 'rock',
  Ghost = 'ghost',
  Dragon = 'dragon',
  Steel = 'steel',
  Dark = 'dark',
  Fairy = 'fairy',
}

export interface Move {
  name: string;
  power: number;
  accuracy: number;
  type: TypeName;
  pp: number;
  maxPp: number;
  priority: number;
  damageClass: 'physical' | 'special' | 'status';
}

export interface Pokemon {
  id: number;
  name: string;
  types: TypeName[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  currentHp: number;
  maxHp: number;
  moves: Move[];
  sprites: {
    front: string;
    back: string;
  };
  isFainted: boolean;
  canMegaEvolve?: boolean;
  isMega?: boolean;
  megaId?: number;
}

export enum BattlePhase {
  Start,
  Menu,
  MoveSelection,
  AttackAnimation,
  TextProcessing,
  Switch,
  Bag, // New phase for catching
  Victory,
  Defeat,
}

export type PokemonAnimationState = 'idle' | 'attacking' | 'hit' | 'faint' | 'mega' | 'mega-entry' | 'recall' | 'release' | 'capture';

export type TrainerAnimationState = 'idle' | 'command' | 'cheer' | 'shock' | 'recall' | 'throw';

export interface BattleState {
  phase: BattlePhase;
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  dialogQueue: string[];
  currentDialog: string;
  turn: number;
  megaPending: boolean;
}
