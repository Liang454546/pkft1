import { TypeName } from './types';

export const TYPE_COLORS: Record<TypeName, string> = {
  [TypeName.Normal]: '#A8A77A',
  [TypeName.Fire]: '#EE8130',
  [TypeName.Water]: '#6390F0',
  [TypeName.Grass]: '#7AC74C',
  [TypeName.Electric]: '#F7D02C',
  [TypeName.Ice]: '#96D9D6',
  [TypeName.Fighting]: '#C22E28',
  [TypeName.Poison]: '#A33EA1',
  [TypeName.Ground]: '#E2BF65',
  [TypeName.Flying]: '#A98FF3',
  [TypeName.Psychic]: '#F95587',
  [TypeName.Bug]: '#A6B91A',
  [TypeName.Rock]: '#B6A136',
  [TypeName.Ghost]: '#735797',
  [TypeName.Dragon]: '#6F35FC',
  [TypeName.Steel]: '#B7B7CE',
  [TypeName.Dark]: '#705746',
  [TypeName.Fairy]: '#D685AD',
};

export const TYPE_NAMES_ZH: Record<TypeName, string> = {
  [TypeName.Normal]: '一般',
  [TypeName.Fire]: '火',
  [TypeName.Water]: '水',
  [TypeName.Grass]: '草',
  [TypeName.Electric]: '電',
  [TypeName.Ice]: '冰',
  [TypeName.Fighting]: '格鬥',
  [TypeName.Poison]: '毒',
  [TypeName.Ground]: '地面',
  [TypeName.Flying]: '飛行',
  [TypeName.Psychic]: '超能力',
  [TypeName.Bug]: '蟲',
  [TypeName.Rock]: '岩石',
  [TypeName.Ghost]: '幽靈',
  [TypeName.Dragon]: '龍',
  [TypeName.Steel]: '鋼',
  [TypeName.Dark]: '惡',
  [TypeName.Fairy]: '妖精',
};

// Type Effectiveness Chart (Rows = Attacker, Cols = Defender)
// 1 = Normal, 2 = Super Effective, 0.5 = Not Very Effective, 0 = No Effect
export const TYPE_CHART: Record<TypeName, Record<TypeName, number>> = {
    [TypeName.Normal]: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, steel: 0.5, dark: 1, fairy: 1 },
    [TypeName.Fire]: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, steel: 2, dark: 1, fairy: 1 },
    [TypeName.Water]: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, steel: 1, dark: 1, fairy: 1 },
    [TypeName.Electric]: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, steel: 1, dark: 1, fairy: 1 },
    [TypeName.Grass]: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, steel: 0.5, dark: 1, fairy: 1 },
    [TypeName.Ice]: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 1, fairy: 1 },
    [TypeName.Fighting]: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, steel: 2, dark: 2, fairy: 0.5 },
    [TypeName.Poison]: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, steel: 0, dark: 1, fairy: 2 },
    [TypeName.Ground]: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, steel: 2, dark: 1, fairy: 1 },
    [TypeName.Flying]: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 1 },
    [TypeName.Psychic]: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, steel: 0.5, dark: 0, fairy: 1 },
    [TypeName.Bug]: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, steel: 0.5, dark: 2, fairy: 0.5 },
    [TypeName.Rock]: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 1 },
    [TypeName.Ghost]: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, dark: 0.5, fairy: 1 },
    [TypeName.Dragon]: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 1, fairy: 0 },
    [TypeName.Steel]: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, steel: 0.5, dark: 1, fairy: 2 },
    [TypeName.Dark]: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, steel: 1, dark: 0.5, fairy: 0.5 },
    [TypeName.Fairy]: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, steel: 0.5, dark: 2, fairy: 1 },
} as any;

// Trainer Sprites
export const PLAYER_TRAINER_SPRITE = "https://play.pokemonshowdown.com/sprites/trainers/ethan.png";
export const ENEMY_TRAINER_SPRITE = "https://play.pokemonshowdown.com/sprites/trainers/n.png";
export const POKEBALL_ICON = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
