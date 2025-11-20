import { Pokemon, Move, TypeName } from '../types';

// Limit to Gen 5 (Unova) for best animated sprite availability for random enemies
const MAX_DEX_ID = 649; 

// Legendary Pokémon that can Mega Evolve (Mewtwo, Rayquaza, Latias, Latios, Groudon, Kyogre)
const MEGA_LEGENDARIES = [150, 384, 380, 381, 382, 383];

// Expanded List of Mega Capable Pokemon (Gen 1-5)
const STANDARD_MEGA_CAPABLE = [
    // Gen 1
    3, 6, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142,
    // Gen 2
    181, 208, 212, 214, 229, 248,
    // Gen 3
    254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
    // Gen 4
    428, 445, 448, 460, 475,
    // Gen 5
    531
];

const getSpriteUrl = (id: number, isBack: boolean) => {
  // Special case for Mega Evolutions (IDs > 10000 usually)
  if (id > 10000) {
    const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/";
    return isBack ? `${baseUrl}back/${id}.gif` : `${baseUrl}${id}.gif`;
  }

  const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";
  return isBack ? `${baseUrl}back/${id}.gif` : `${baseUrl}${id}.gif`;
};

const fetchMoveDetails = async (url: string): Promise<Move | null> => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.power === null) return null; 

    const zhName = data.names.find((n: any) => n.language.name === 'zh-Hant')?.name 
                 || data.names.find((n: any) => n.language.name === 'zh-Hans')?.name
                 || data.name;

    return {
      name: zhName,
      power: data.power || 0,
      accuracy: data.accuracy || 100,
      pp: data.pp,
      maxPp: data.pp,
      type: data.type.name as TypeName,
      priority: data.priority,
      damageClass: data.damage_class.name,
    };
  } catch (e) {
    return null;
  }
};

const fetchPokemonData = async (idOrName: string | number): Promise<Pokemon> => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  const data = await res.json();

  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();
  const zhName = speciesData.names.find((n: any) => n.language.name === 'zh-Hant')?.name 
               || speciesData.names.find((n: any) => n.language.name === 'zh-Hans')?.name
               || data.name;

  const megaVariety = speciesData.varieties.find((v: any) => 
      v.pokemon.name.endsWith('-mega-x') || v.pokemon.name.endsWith('-mega') || v.pokemon.name.endsWith('-primal')
  );
  
  const canMega = !!megaVariety;
  const megaId = megaVariety ? parseInt(megaVariety.pokemon.url.split('/').filter(Boolean).pop()) : undefined;

  const movesData = data.moves;
  const selectedMoves: Move[] = [];
  const shuffledMoves = movesData.sort(() => 0.5 - Math.random());
  
  for (const m of shuffledMoves) {
    if (selectedMoves.length >= 4) break;
    const moveDetails = await fetchMoveDetails(m.move.url);
    if (moveDetails) {
      selectedMoves.push(moveDetails);
    }
  }

  if (selectedMoves.length === 0) {
      selectedMoves.push({
          name: "衝撞", power: 40, accuracy: 100, pp: 35, maxPp: 35, 
          type: TypeName.Normal, priority: 0, damageClass: 'physical'
      });
  }

  return {
    id: data.id,
    name: zhName,
    types: data.types.map((t: any) => t.type.name as TypeName),
    stats: {
      hp: data.stats[0].base_stat * 2 + 110, 
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      spAttack: data.stats[3].base_stat,
      spDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    maxHp: data.stats[0].base_stat * 2 + 110,
    currentHp: data.stats[0].base_stat * 2 + 110,
    moves: selectedMoves,
    sprites: {
      front: getSpriteUrl(data.id, false),
      back: getSpriteUrl(data.id, true),
    },
    isFainted: false,
    canMegaEvolve: canMega,
    isMega: false,
    megaId: megaId 
  };
}

export const fetchRandomPokemon = async (count: number = 6): Promise<Pokemon[]> => {
  // For enemy team, also give them some Megas for fun
  const leg = [...MEGA_LEGENDARIES].sort(() => 0.5 - Math.random()).slice(0, 1);
  const std = [...STANDARD_MEGA_CAPABLE].sort(() => 0.5 - Math.random()).slice(0, 2);
  
  const promises = [];
  promises.push(fetchPokemonData(leg[0]));
  promises.push(fetchPokemonData(std[0]));
  promises.push(fetchPokemonData(std[1]));
  
  for(let i=0; i < count - 3; i++) {
      const id = Math.floor(Math.random() * MAX_DEX_ID) + 1;
      promises.push(fetchPokemonData(id));
  }
  
  return Promise.all(promises);
};

export const fetchMegaCapableTeam = async (count: number = 6): Promise<Pokemon[]> => {
    // 2 Legendary Megas
    const legendaries = [...MEGA_LEGENDARIES].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    // 4 Standard Megas (Randomly picked from the large pool)
    const standards = [...STANDARD_MEGA_CAPABLE].sort(() => 0.5 - Math.random()).slice(0, count - 2);
    
    const selectedIds = [...legendaries, ...standards];
    
    const promises = selectedIds.map(id => fetchPokemonData(id));
    return Promise.all(promises);
};

export const fetchMegaData = async (original: Pokemon): Promise<Pokemon> => {
    if (!original.megaId) return original;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${original.megaId}`);
    const data = await res.json();
    const hpRatio = original.currentHp / original.maxHp;
    const newMaxHp = data.stats[0].base_stat * 2 + 110;
    
    // Custom naming for Primals
    let prefix = "超級";
    if (original.name.includes("蓋歐卡") || original.name.includes("固拉多")) {
        prefix = "原始回歸 ";
    }
    const megaName = `${prefix}${original.name}`;

    return {
        ...original,
        name: megaName,
        types: data.types.map((t: any) => t.type.name as TypeName),
        stats: {
            hp: newMaxHp,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            spAttack: data.stats[3].base_stat,
            spDefense: data.stats[4].base_stat,
            speed: data.stats[5].base_stat,
        },
        maxHp: newMaxHp,
        currentHp: Math.floor(newMaxHp * hpRatio),
        sprites: {
            front: getSpriteUrl(data.id, false),
            back: getSpriteUrl(data.id, true),
        },
        isMega: true,
    };
}