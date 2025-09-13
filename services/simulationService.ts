
import type { Tribute, GameDay, Item, GameEvent, Relationship, Arena } from '../types';
import { RelationshipLevel } from '../types';
import { EVENTS, DEATHS, ITEMS, RECIPES, SKILLS, ALLIANCE_ADJECTIVES, ALLIANCE_NOUNS, TRAPS } from '../constants';

type Action = 'hunt' | 'craft' | 'heal' | 'forage' | 'rest' | 'neutral' | 'alliance';
interface TributeAction {
    action: Action;
    target?: Tribute;
    recipe?: typeof RECIPES[0];
}


// --- Helper Functions ---
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const roll = (sides: number = 20): number => Math.floor(Math.random() * sides) + 1;

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getTributeById = (tributes: (Tribute | {id: number})[], id: number): Tribute | undefined => tributes.find(t => t.id === id) as Tribute | undefined;

const hasTrait = (t: Tribute, traitName: string): boolean => t.traits.some(trait => trait.name === traitName);
const hasSkill = (t: Tribute, skillName: string): boolean => t.skills.some(skill => skill.name === skillName);

const getModifiedStats = (tribute: Tribute): Omit<Tribute, 'relationships' | 'inventory' | 'allies'> => {
    const modified = { ...tribute };
    
    let { strength, agility, speed, intelligence } = tribute;

    // Effects of low vitals
    if (tribute.health < 50) {
        strength = Math.max(1, strength - 1);
        agility = Math.max(1, agility - 1);
        speed = Math.max(1, speed - 1);
    }
    if (tribute.health < 25) {
        strength = Math.max(1, strength - 2);
    }
    if (tribute.food < 20 || tribute.water < 20) {
        strength = Math.max(1, strength - 1);
        intelligence = Math.max(1, intelligence - 1);
    }
    
    // Effects of injuries (permanent max health reduction)
    if(tribute.maxHealth < 80) {
        speed = Math.max(1, speed - 1);
        agility = Math.max(1, agility - 1);
    }
    if(tribute.maxHealth < 60) {
        speed = Math.max(1, speed - 1); // cumulative
    }

    modified.strength = strength;
    modified.agility = agility;
    modified.speed = speed;
    modified.intelligence = intelligence;

    if(hasTrait(tribute, 'Illiterate')) {
        modified.intelligence = Math.max(1, intelligence - 2);
    }

    return modified;
};


const calculatePowerScore = (tribute: Tribute): number => {
    const stats = getModifiedStats(tribute);
    const weapon = tribute.inventory.filter(i => i.type === 'weapon').sort((a, b) => (b.effect.damage || 0) - (a.effect.damage || 0))[0];
    const weaponDamage = weapon ? (weapon.effect.damage || 0) : 2; // Base damage for unarmed
    return tribute.health + (stats.strength * 1.5) + stats.agility + stats.speed + (weaponDamage / 2) + tribute.morale;
};

const getInjuryDescription = (damage: number): string => {
    if (damage <= 0) return "no injuries";
    if (damage <= 10) return "minor injuries";
    if (damage <= 25) return "a moderate injury";
    if (damage <= 40) return "a major injury";
    if (damage >= 90) return "a fatal injury";
    return "a critical injury";
}

const getRelationshipLevelFromScore = (score: number): RelationshipLevel => {
    if (score >= 80) return RelationshipLevel.MaximumAlly;
    if (score >= 60) return RelationshipLevel.CloseAlly;
    if (score >= 20) return RelationshipLevel.Ally;
    if (score > -20) return RelationshipLevel.Neutral;
    return RelationshipLevel.Enemy;
};

const updateRelationship = (tribute: Tribute, targetId: number, scoreChange: number) => {
    if (!tribute || tribute.id === targetId) return;
    const currentScore = tribute.relationships[targetId]?.score ?? 0;
    const newScore = Math.max(-100, Math.min(100, currentScore + scoreChange));
    tribute.relationships[targetId] = {
        score: newScore,
        level: getRelationshipLevelFromScore(newScore),
    };
};


type Personality = 'Brute' | 'Career' | 'Strategist' | 'Survivor' | 'Runner' | 'Charmer';

const getPersonality = (tribute: Tribute): Personality => {
    const isCareerDistrict = [1, 2, 4].includes(tribute.district);
    const isCombatFocused = tribute.strength + tribute.agility > 15;

    if (hasTrait(tribute, 'Reckless')) return 'Brute';
    if ((isCareerDistrict || isCombatFocused) && !hasTrait(tribute, 'Cowardly')) return 'Career';
    if (hasSkill(tribute, 'Charismatic') || (tribute.charisma >= 8 && tribute.intelligence >= 6)) return 'Charmer';
    if (hasSkill(tribute, 'Sprinter') || (tribute.speed >= 8 && tribute.agility >= 7)) return 'Runner';
    if (tribute.strength >= 8 && tribute.intelligence <= 5) return 'Brute';
    if (hasSkill(tribute, 'Technologist') || tribute.intelligence >= 8) return 'Strategist';
    return 'Survivor';
};

const killTribute = (
    tribute: Tribute,
    allTributes: Tribute[],
    deaths: { tributeName: string; tributeId: number; cause: string }[],
    cause: string,
    events: GameEvent[],
    timestamp: string
) => {
    const tributeToUpdate = getTributeById(allTributes, tribute.id);
    if (tributeToUpdate && tributeToUpdate.status === 'alive') {
        tributeToUpdate.status = 'dead';
        tributeToUpdate.causeOfDeath = cause;
        deaths.push({ tributeName: tributeToUpdate.name, tributeId: tributeToUpdate.id, cause });

        // Morale update for other tributes
        allTributes.forEach(t => {
            if (t.status === 'alive' && t.id !== tribute.id) {
                const relationship = t.relationships[tribute.id];
                if (relationship) {
                    if (relationship.level === RelationshipLevel.MaximumAlly || relationship.level === RelationshipLevel.CloseAlly) {
                        t.morale = Math.max(-10, t.morale - 8);
                        events.push({ text: `${t.name} is devastated by the death of their ally, ${tribute.name}.`, type: 'negative', timestamp });
                    } else if (relationship.level === RelationshipLevel.Ally || (t.district === tribute.district && !t.allies.includes(tribute.id))) {
                        t.morale = Math.max(-10, t.morale - 4);
                    } else if (relationship.level === RelationshipLevel.Enemy) {
                        t.morale = Math.min(10, t.morale + 5);
                        events.push({ text: `${t.name} celebrates the death of their enemy, ${tribute.name}.`, type: 'positive', timestamp });
                    }
                }
            }
        });

        // Update allies array for all tributes
        allTributes.forEach(t => {
            if (t.allies.includes(tribute.id)) {
                t.allies = t.allies.filter(id => id !== tribute.id);
                if (t.allies.length <= 1) {
                    t.allianceName = undefined;
                    if (t.allies.length === 1) {
                        const lastAlly = getTributeById(allTributes, t.allies[0]);
                        if (lastAlly) {
                            lastAlly.allianceName = undefined;
                        }
                    }
                }
            }
        });
    }
};

const getArenaCombatBonus = (tribute: Tribute, arena: Arena): { attack: number, defense: number } => {
    const bonus = { attack: 0, defense: 0 };
    if (arena.type === 'forest' || arena.type === 'jungle') {
        if (tribute.agility > 7) bonus.defense += 1;
        if (hasSkill(tribute, 'Stealth')) bonus.attack += 2; // Good for ambushes
    } else if (arena.type === 'urban') {
        if (tribute.intelligence > 7) bonus.attack += 2;
        if (tribute.agility > 6) bonus.defense += 1;
    } else if (arena.type === 'mountain') {
        if (tribute.strength > 7) bonus.attack += 1;
        if (tribute.agility > 8) bonus.defense += 2; // Sure-footed
    } else if (arena.type === 'desert' || arena.type === 'tundra') {
        if (hasSkill(tribute, 'Survivalist')) bonus.defense += 1;
    }
    return bonus;
};

const resolveEncounter = (
    initiator: Tribute,
    target: Tribute,
    allTributes: Tribute[],
    events: GameEvent[],
    deaths: { tributeName: string; tributeId: number; cause: string }[],
    arena: Arena,
    timestamp: string,
    isBloodbath: boolean = false
) => {
    events.push({ text: `[ENCOUNTER] ${initiator.name} encounters ${target.name}.`, type: 'combat', timestamp });

    const initiatorStats = getModifiedStats(initiator);
    const targetStats = getModifiedStats(target);

    // Flee attempt
    const fleeRoll = roll();
    let fleeBonus = hasTrait(target, 'Cowardly') ? 5 : 0;
    if (hasSkill(initiator, 'Intimidating')) fleeBonus += 3;

    if ( (hasSkill(target, 'Sprinter') && fleeRoll > 6) || (targetStats.speed > initiatorStats.speed && (fleeRoll + fleeBonus) > 12)) {
        events.push({ text: `${target.name} uses their superior speed to escape from ${initiator.name}.`, type: 'neutral', timestamp });
        target.morale = Math.min(10, target.morale + 1);
        initiator.morale = Math.max(-10, initiator.morale -1);
        return;
    }
    
    // Trapper skill check for defender
    if(hasSkill(target, 'Trapper') && roll() > 16) {
        const trapDamage = 5 + targetStats.intelligence;
        initiator.health -= trapDamage;
        events.push({ text: `${initiator.name} walks right into a hidden trap set by ${target.name}, receiving ${getInjuryDescription(trapDamage)}!`, type: 'combat', timestamp });
        if(initiator.health <= 0) {
            const cause = `Was killed by one of ${target.name}'s traps.`;
            killTribute(initiator, allTributes, deaths, cause, events, timestamp);
            const killer = getTributeById(allTributes, target.id);
            if(killer) killer.kills++;
            return;
        }
    }


    const getWeaponBonus = (t: Tribute) => {
        const weapons = t.inventory.filter(i => i.type === 'weapon').sort((a, b) => (b.effect.damage || 0) - (a.effect.damage || 0));
        const weapon = weapons[0]; // Get the best weapon
        if (!weapon) return 0;
        let bonus = weapon.effect.damage || 0;
        if (hasSkill(t, 'Marksman') && (weapon.name.includes('Bow') || weapon.name.includes('Knives') || weapon.name.includes('Slingshot'))) {
            bonus *= 1.3;
             if (arena.type === "forest" || arena.type === "jungle") {
                bonus *= 0.9; // Penalty in dense terrain
            }
        }
        return bonus;
    };
    
    const getSkillBonus = (t: Tribute, stats: Omit<Tribute, 'relationships' | 'inventory' | 'allies'>) => {
        let bonus = 0;
        if (hasSkill(t, 'Brawler') && !t.inventory.some(i => i.type === 'weapon')) bonus += 5;
        if (hasSkill(t, 'Berserker')) bonus += Math.floor((100 - stats.health) / 8);
        if (hasSkill(t, 'Assassin')) bonus += 4; // Bonus damage on initiation
        return bonus;
    }
    
    const getTraitModifier = (t: Tribute) => {
        let mod = 0;
        if (hasTrait(t, 'Clumsy')) mod -= 3;
        if (hasTrait(t, 'Reckless')) mod += 3;
        return mod;
    }

    // AMBUSH & CRITICAL HIT LOGIC
    let isAmbush = false;
    let isCriticalHit = false;
    const stealthBonus = (hasSkill(initiator, 'Stealth') ? 2 : 0) + (hasSkill(initiator, 'Camouflage') ? 3 : 0) + (hasSkill(initiator, 'Ambusher') ? 4 : 0);
    if ((hasSkill(initiator, 'Assassin') || stealthBonus > 0) && roll() > (18 - initiatorStats.intelligence - stealthBonus)) {
        isAmbush = true;
    }
    if (roll() > 18) {
        isCriticalHit = true;
    }

    const handleDamage = (victim: Tribute, damage: number) => {
        victim.health -= damage;
        if (damage > 30) {
            const maxHealthReduction = roll(5);
            victim.maxHealth = Math.max(20, victim.maxHealth - maxHealthReduction);
        }
    }

    const handleDeath = (victim: Tribute, killer: Tribute) => {
        const weapons = killer.inventory.filter(i => i.type === 'weapon').sort((a, b) => (b.effect.damage || 0) - (a.effect.damage || 0));
        const weapon = weapons[0];
        let cause = '';
        let eventText = '';

        if (weapon) {
            cause = getRandomElement(DEATHS.weapon).replace('{attacker}', killer.name).replace('{victim}', victim.name).replace('{weapon}', weapon.name);
            eventText = `${victim.name} couldn't defend against the onslaught and was killed by ${killer.name} with a ${weapon.name}.`;
        } else {
            cause = getRandomElement(DEATHS.unarmed).replace('{attacker}', killer.name).replace('{victim}', victim.name);
            eventText = `${victim.name} was beaten to death by ${killer.name}.`;
        }

        events.push({ text: eventText, type: 'death', timestamp });
        killTribute(victim, allTributes, deaths, cause, events, timestamp);
        
        const killerToUpdate = getTributeById(allTributes, killer.id);
        if (killerToUpdate) {
            killerToUpdate.kills++;
            killerToUpdate.morale = Math.min(10, killerToUpdate.morale + 3);
            if (victim.inventory.length > 0) {
                const loot = victim.inventory.filter(i => i.type !== 'material').slice(0, 2);
                if (loot.length > 0) {
                    events.push({ text: `${killerToUpdate.name} loots ${loot.map(i => i.name).join(', ')} from ${victim.name}'s body.`, type: 'item', timestamp });
                    killerToUpdate.inventory.push(...loot);
                }
            }

            // WITNESS LOGIC
            const witnesses = allTributes.filter(t => t.status === 'alive' && t.id !== killerToUpdate.id && t.allies.includes(victim.id));
            witnesses.forEach(witness => {
                if (roll() > 8) { // 65% chance of finding out
                    updateRelationship(witness, killerToUpdate.id, -100);
                    // Dissolve any alliance between witness and killer
                    if (witness.allies.includes(killerToUpdate.id)) {
                        witness.allies = witness.allies.filter(id => id !== killerToUpdate.id);
                        killerToUpdate.allies = killerToUpdate.allies.filter(id => id !== witness.id);
                        witness.allianceName = undefined;
                        killerToUpdate.allianceName = undefined;
                        events.push({ text: `The alliance between ${witness.name} and ${killerToUpdate.name} shatters.`, type: 'betrayal', timestamp });
                    }
                    events.push({ text: `${witness.name} learns that ${killerToUpdate.name} killed their ally, ${victim.name}. Vengeance is sworn.`, type: 'betrayal', timestamp });
                }
            });
        }
    };

    if (isAmbush) {
        let ambushDamage = (roll(10) + initiatorStats.intelligence) * (hasSkill(initiator, 'Assassin') ? 2.5 : 1.8);
        if (hasSkill(target, 'Fortified')) ambushDamage *= 0.7; 
        if(isCriticalHit) ambushDamage *= 2;

        handleDamage(target, ambushDamage);
        
        let eventText = `${initiator.name} launches a surprise attack from the shadows${isCriticalHit ? ' with deadly precision' : ''}, dealing ${getInjuryDescription(ambushDamage)} to ${target.name}!`;
        events.push({ text: eventText, type: 'combat', timestamp });

        if (target.health <= 0) {
            handleDeath(target, initiator);
            return;
        }
    }
    
    let initiatorScore = initiatorStats.strength + (initiatorStats.agility * 0.5) + initiator.morale + getWeaponBonus(initiator) + getSkillBonus(initiator, initiatorStats) + getTraitModifier(initiator) + getArenaCombatBonus(initiator, arena).attack + roll();
    let targetScore = targetStats.strength + (targetStats.agility * 0.5) + target.morale + getWeaponBonus(target) + getSkillBonus(target, targetStats) + getTraitModifier(target) + getArenaCombatBonus(target, arena).defense + roll();
    
    // Ally Support
    const getAllyHelp = (tribute: Tribute, opponent: Tribute) => {
        return tribute.allies.map(id => getTributeById(allTributes, id)).filter((ally): ally is Tribute => {
            if (!ally || ally.status !== 'alive') return false;
            const relWithTribute = ally.relationships[tribute.id]?.score ?? 0;
            const relWithOpponent = ally.relationships[opponent.id]?.score ?? -10;
            // More likely to help a close friend, less likely if they don't hate the opponent
            const helpChance = 10 + Math.floor(relWithTribute / 10) - Math.floor(relWithOpponent / 20);
            return roll() < helpChance;
        });
    }

    const initiatorHelp = getAllyHelp(initiator, target);
    const targetHelp = getAllyHelp(target, initiator);
    
    if (initiatorHelp.length > 0) {
        events.push({ text: `${initiatorHelp.map(t => t.name).join(' and ')} join${initiatorHelp.length === 1 ? 's' : ''} the fight to help ${initiator.name}!`, type: 'combat', timestamp });
    }
    if (targetHelp.length > 0) {
        events.push({ text: `${targetHelp.map(t => t.name).join(' and ')} rush${targetHelp.length === 1 ? 'es' : ''} to defend ${target.name}!`, type: 'combat', timestamp });
    }
    
    initiatorScore += initiatorHelp.length * 8;
    targetScore += targetHelp.length * 9; // defense slightly stronger

    if (isCriticalHit) initiatorScore *= 1.5;

    if (hasTrait(initiator, 'Arrogant')) initiatorScore *= 0.9;
    if (hasTrait(target, 'Arrogant')) targetScore *= 0.9;

    const scoreDiff = initiatorScore - targetScore;

    if (Math.abs(scoreDiff) < 5 && !isBloodbath && !isAmbush) {
        const damage = 5 + roll(4);
        handleDamage(initiator, damage);
        handleDamage(target, damage);
        events.push({ text: `${initiator.name} and ${target.name} are evenly matched. After a brief, intense skirmish, they both disengage to lick their wounds, each sustaining minor injuries.`, type: 'combat', timestamp });
        if (initiator.health <= 0) { handleDeath(initiator, target); return; }
        if (target.health <= 0) { handleDeath(target, initiator); return; }
        return;
    }

    if (scoreDiff >= 0) { // Initiator wins exchange
        let damage = Math.max(8, 10 + (scoreDiff * 1.5) + roll(6)) * (isBloodbath ? 3 : 1);
        if (hasSkill(target, 'Fortified')) damage *= 0.7;
        
        handleDamage(target, damage);
        events.push({ text: `${initiator.name} overpowers ${target.name}, inflicting ${getInjuryDescription(damage)}.`, type: 'combat', timestamp });
        
        updateRelationship(target, initiator.id, -40);
        initiator.morale = Math.min(10, initiator.morale + 2);
        target.morale = Math.max(-10, target.morale - 3);

        if (target.health <= 0) handleDeath(target, initiator);
    } else { // Target wins exchange
        let damage = Math.max(5, 10 + (Math.abs(scoreDiff) * 1.2) + roll(4)) * (isBloodbath ? 2.5 : 1);
        if (hasSkill(initiator, 'Fortified')) damage *= 0.7;
        
        handleDamage(initiator, damage);
        events.push({ text: `${target.name} fends off ${initiator.name}'s attack and counters, inflicting ${getInjuryDescription(damage)}.`, type: 'combat', timestamp });
        
        updateRelationship(initiator, target.id, -40);
        target.morale = Math.min(10, target.morale + 2);
        initiator.morale = Math.max(-10, initiator.morale - 3);

        if (initiator.health <= 0) handleDeath(initiator, target);
    }
};

const checkForSponsorGift = (tribute: Tribute, events: GameEvent[], timestamp: string) => {
    const charismaBonus = tribute.charisma / 2;
    const killBonus = tribute.kills * 2;
    const lowHealthBonus = tribute.health < 30 ? 3 : 0;
    const sponsorRoll = roll() + charismaBonus + killBonus + lowHealthBonus;
    
    if (sponsorRoll > 24) { // Increased difficulty to make it more special
        const weightedPool: Item[] = [];
        Object.values(ITEMS).filter(i => !i.source?.includes('built') && i.type !== 'material').forEach(item => {
            let weight = 4;
            if (item.type === 'weapon' && (item.effect.damage || 0) > 15) weight = 1;
            else if (item.type === 'medicine') weight = 5;
            else if (item.type === 'food' || item.type === 'water') weight = 6;
            for (let i = 0; i < weight; i++) weightedPool.push(item);
        });
        
        if (weightedPool.length > 0) {
            const gift = getRandomElement(weightedPool);
            tribute.inventory.push(gift);
            tribute.morale = Math.min(10, tribute.morale + 4);
            events.push({ text: `A sponsor drone descends, delivering a ${gift.name} to ${tribute.name}! The crowd cheers.`, type: 'positive', timestamp });
        }
    }
};

const findBestTargetToHunt = (tribute: Tribute, potentialTargets: Tribute[], day: number): Tribute | null => {
    if (hasTrait(tribute, 'Cowardly')) {
        return null;
    }

    const personality = getPersonality(tribute);
    const myPower = calculatePowerScore(tribute);

    const validTargets = potentialTargets.filter(t => {
        const theirPower = calculatePowerScore(t);
        const relScore = tribute.relationships[t.id]?.score ?? 0;

        if (relScore > 20) return false; // Don't hunt allies

        if (hasTrait(tribute, 'Overconfident')) {
            return relScore < 10 || theirPower < myPower * 1.4; // Will take very unfair fights
        }

        switch (personality) {
            case 'Brute':
                return relScore < 0 || theirPower < myPower * 1.2; // Will take a slightly unfair fight
            case 'Career':
                 if (day <= 3) return relScore < 10 || theirPower < myPower * 1.25; // More aggressive early on
                 return relScore < 10 || theirPower < myPower * 1.1; // Prefers fair or advantageous fights
            case 'Strategist':
                return relScore < -20 || theirPower < myPower * 0.8; // Only hunts with a clear advantage or against hated enemies
            default: // Survivor, Runner, Charmer
                return relScore < -40 && theirPower < myPower * 0.9; // Only hunts weak, hated enemies
        }
    });

    if (validTargets.length === 0) return null;

    // Sort by lowest relationship, then by lowest health
    validTargets.sort((a, b) => {
        const relA = tribute.relationships[a.id]?.score ?? 0;
        const relB = tribute.relationships[b.id]?.score ?? 0;
        if (relA !== relB) return relA - relB;
        return a.health - b.health;
    });

    return validTargets[0];
}

const checkCanCraft = (tribute: Tribute, recipe: typeof RECIPES[0]): boolean => {
    const inventoryCounts: { [key: string]: number } = {};
    tribute.inventory.forEach(item => {
        inventoryCounts[item.name] = (inventoryCounts[item.name] || 0) + 1;
    });

    const componentCounts: { [key: string]: number } = {};
    recipe.components.forEach(compKey => {
        const compName = ITEMS[compKey].name;
        componentCounts[compName] = (componentCounts[compName] || 0) + 1;
    });

    return Object.entries(componentCounts).every(([compName, requiredCount]) => 
        (inventoryCounts[compName] || 0) >= requiredCount
    );
};

const selectTributeAction = (tribute: Tribute, aliveTributes: Tribute[], arena: Arena, day: number): TributeAction => {
    // 1. Immediate, critical needs have the highest priority
    if (tribute.health < 35 && tribute.inventory.some(i => i.type === 'medicine')) return { action: 'heal' };
    if (tribute.health < 25 && roll() > 4) return { action: 'rest' };
    if (tribute.water < 20 && roll() > 3) return { action: 'forage' };
    if (tribute.food < 20 && roll() > 3) return { action: 'forage' };
    
    // 2. Personality-driven actions with some randomness
    const personality = getPersonality(tribute);
    const decisionRoll = roll();

    // Check for crafting opportunities
    const intelligenceBonus = (hasSkill(tribute, 'Technologist') ? 2 : 0) + (hasSkill(tribute, 'Resourceful') ? 2 : 0);
    const bestWeaponDamage = Math.max(2, ...tribute.inventory.filter(i => i.type === 'weapon').map(i => i.effect.damage || 0));
    
    const potentialCrafts = shuffleArray(RECIPES).find(r => 
        (ITEMS[r.result].effect.damage || 0) > bestWeaponDamage &&
        getModifiedStats(tribute).intelligence >= (r.intelligenceThreshold - intelligenceBonus) && 
        checkCanCraft(tribute, r)
    );

    if (potentialCrafts && (personality === 'Strategist' || decisionRoll > 14)) {
        return { action: 'craft', recipe: potentialCrafts };
    }
    
    // Hunting logic
    let huntUrge = 8;
    if (day <= 3) huntUrge = 5; // More likely to hunt in first 3 days
    if (personality === 'Career' || personality === 'Brute') huntUrge -= 3;


    if (decisionRoll > huntUrge) {
         const potentialTargets = aliveTributes.filter(t => t.id !== tribute.id && !tribute.allies.includes(t.id));
         const target = findBestTargetToHunt(tribute, potentialTargets, day);
         if (target) {
            return { action: 'hunt', target };
        }
    }

    // Moderate needs check
    if (tribute.health < 60 && decisionRoll > 10) return { action: 'rest' };
    if ((tribute.water < 50 || tribute.food < 50) && decisionRoll > 8) return { action: 'forage' };
    
    // Default actions based on personality, if no pressing need
    switch(personality) {
        case 'Runner':
        case 'Survivor':
            return { action: 'forage' };
        case 'Strategist':
             if (decisionRoll > 10) {
                 const anyCraft = shuffleArray(RECIPES).find(r => 
                    getModifiedStats(tribute).intelligence >= (r.intelligenceThreshold - intelligenceBonus) && 
                    checkCanCraft(tribute, r)
                 );
                 if (anyCraft) return { action: 'craft', recipe: anyCraft };
             }
             return { action: 'forage' };
    }

    // Final fallback action
    return { action: 'neutral' };
}

const handleTrapEncounter = (
    tribute: Tribute,
    allTributes: Tribute[],
    events: GameEvent[],
    deaths: { tributeName: string; tributeId: number; cause: string }[],
    timestamp: string
) => {
    const trap = getRandomElement(TRAPS);
    const stats = getModifiedStats(tribute);

    // Detection Phase
    const detectionBonus = hasSkill(tribute, 'Technologist') ? 3 : (hasSkill(tribute, 'Naturalist') ? 2 : 0);
    const detectionRoll = roll() + Math.floor(stats.intelligence / 2);

    if (detectionRoll + detectionBonus >= trap.detectionDC) {
        events.push({ text: trap.successDescription.replace('{name}', tribute.name), type: 'positive', timestamp });
        return; // Trap avoided
    }

    // Evasion Phase
    const evasionBonus = hasSkill(tribute, 'Sprinter') ? 3 : 0;
    const evasionRoll = roll() + Math.floor(stats.agility / 2);

    if (evasionRoll + evasionBonus >= trap.evasionDC) {
        let evadeDamage = Math.floor(trap.damage / 4);
        tribute.health -= evadeDamage;
        events.push({ text: trap.evadeDescription.replace('{name}', tribute.name), type: 'neutral', timestamp });

        if (tribute.health <= 0) {
            killTribute(tribute, allTributes, deaths, `Succumbed to injuries while narrowly escaping a ${trap.name}.`, events, timestamp);
        }
        return;
    }

    // Failure Phase
    let damage = trap.damage;
    if (hasSkill(tribute, 'Fortified')) {
        damage *= 0.7;
    }
    damage = Math.floor(damage);
    tribute.health -= damage;
    
    let eventText = trap.description.replace('{name}', tribute.name);
    
    // Apply secondary effects
    if (trap.effect) {
        const { stat, change } = trap.effect;
        const statKey = stat as keyof Tribute;
        if(typeof tribute[statKey] === 'number') {
            (tribute[statKey] as number) = Math.max(1, (tribute[statKey] as number) + change);
            eventText += ` Their ${stat} is temporarily reduced!`;
        }
    }

    eventText += ` They suffer ${getInjuryDescription(damage)}.`;
    events.push({ text: eventText, type: 'trap', timestamp });

    if (tribute.health <= 0) {
        killTribute(tribute, allTributes, deaths, `Was killed by a ${trap.name}.`, events, timestamp);
    }
};

const performAction = (
    tribute: Tribute,
    action: Action,
    allTributes: Tribute[],
    events: GameEvent[],
    deaths: { tributeName: string; tributeId: number; cause: string }[],
    arena: Arena,
    timestamp: string,
    options: { target?: Tribute, recipe?: typeof RECIPES[0] }
) => {
    switch (action) {
        case 'hunt': {
            const target = getTributeById(allTributes, options.target?.id ?? -1);
            if (target && target.status === 'alive') {
                resolveEncounter(tribute, target, allTributes, events, deaths, arena, timestamp);
            }
            break;
        }
        case 'craft': {
            const recipe = options.recipe;
            if (recipe && checkCanCraft(tribute, recipe)) {
                 // Consume components
                const componentsToRemove = [...recipe.components];
                tribute.inventory = tribute.inventory.filter(item => {
                    const index = componentsToRemove.findIndex(compKey => ITEMS[compKey].name === item.name);
                    if (index !== -1) {
                        componentsToRemove.splice(index, 1);
                        return false; // Don't keep this item
                    }
                    return true; // Keep this item
                });

                // Add result
                tribute.inventory.push(ITEMS[recipe.result]);
                events.push({ text: getRandomElement(EVENTS.universal.crafting).replace('{name}', tribute.name).replace('{item}', ITEMS[recipe.result].name), type: 'crafting', timestamp });
            } else {
                events.push({ text: `${tribute.name} tries to craft something, but fails.`, type: 'negative', timestamp });
            }
            break;
        }
        case 'heal': {
            const medicine = tribute.inventory.find(i => i.type === 'medicine');
            if (medicine) {
                tribute.inventory = tribute.inventory.filter(i => i.name !== medicine.name);
                let healingAmount = medicine.effect.healing || 0;
                if (hasSkill(tribute, 'Medic')) healingAmount *= 1.5;
                tribute.health = Math.min(tribute.maxHealth, tribute.health + healingAmount);
                events.push({ text: `${tribute.name} uses a ${medicine.name} and recovers some health.`, type: 'positive', timestamp });
            }
            break;
        }
        case 'forage': {
            const forageRoll = roll() + Math.floor(getModifiedStats(tribute).intelligence / 2) + (hasSkill(tribute, 'Survivalist') ? 4 : 0);
            if (forageRoll > 12) {
                const arenaSpecificItems = (EVENTS as any)[arena.name]?.positive.map((s:string) => s.match(/a ([\w\s]+),/)?.[1]).filter(Boolean) || [];
                const itemTypeRoll = roll();
                let foundItem: Item | undefined;
                if(itemTypeRoll > 16 && arenaSpecificItems.length > 0) {
                     // Arena specific finds
                } else if(itemTypeRoll > 12) {
                    foundItem = getRandomElement(Object.values(ITEMS).filter(i => i.type === 'food' || i.type === 'water'));
                } else {
                    foundItem = getRandomElement(Object.values(ITEMS).filter(i => i.type === 'material'));
                }

                if(foundItem) {
                    tribute.inventory.push(foundItem);
                    events.push({ text: `${tribute.name} forages and finds a ${foundItem.name}.`, type: 'item', timestamp });
                } else {
                    events.push({ text: `${tribute.name} finds a clean source of water.`, type: 'positive', timestamp });
                    tribute.water = Math.min(100, tribute.water + 30);
                }

            } else if (forageRoll > 8) {
                events.push({ text: `${tribute.name} searches for resources but finds nothing of use.`, type: 'neutral', timestamp });
            } else {
                 if(hasTrait(tribute, 'Weak Stomach') && roll() > 10) {
                     tribute.health -= 10;
                     events.push({ text: `${tribute.name} eats some strange berries and gets sick.`, type: 'negative', timestamp });
                 } else {
                    events.push({ text: `${tribute.name}'s foraging attempt is unsuccessful and wastes energy.`, type: 'negative', timestamp });
                 }
            }
            break;
        }
        case 'rest': {
            const recovery = 5 + roll(5);
            tribute.health = Math.min(tribute.maxHealth, tribute.health + recovery);
            events.push({ text: `${tribute.name} finds a safe place to rest and recovers some health.`, type: 'positive', timestamp });
            break;
        }
        case 'neutral': {
            const eventPool = [...EVENTS.universal.neutral];
            // Personality-based events
            if(hasTrait(tribute, 'Paranoid')) eventPool.push(...EVENTS.universal.negative.filter(e => e.includes('paranoia')));
            
            events.push({ text: getRandomElement(eventPool).replace('{name}', tribute.name), type: 'neutral', timestamp });
            break;
        }
    }
};

const handleAllianceActions = (
    allTributes: Tribute[],
    events: GameEvent[],
    timestamp: string
) => {
    const processedTributes = new Set<number>();
    allTributes.forEach(tribute => {
        if (processedTributes.has(tribute.id) || tribute.allies.length === 0 || tribute.status !== 'alive') return;

        const allianceMembers = [tribute, ...tribute.allies.map(id => getTributeById(allTributes, id)).filter((t): t is Tribute => !!t && t.status === 'alive')];
        allianceMembers.forEach(m => processedTributes.add(m.id));

        const allianceName = tribute.allianceName || `The ${getRandomElement(ALLIANCE_ADJECTIVES)} ${getRandomElement(ALLIANCE_NOUNS)}`;
        allianceMembers.forEach(m => m.allianceName = allianceName);

        const actionRoll = roll();
        if (actionRoll > 15) { // Positive event
            let eventText = getRandomElement(EVENTS.universal.allianceActions.positive)
                .replace('{alliance}', allianceName);
            if(eventText.includes('{name1}')) eventText = eventText.replace('{name1}', getRandomElement(allianceMembers).name);
            if(eventText.includes('{name2}')) eventText = eventText.replace('{name2}', getRandomElement(allianceMembers.filter(m => !eventText.includes(m.name))).name);
            if(eventText.includes('{item}')) eventText = eventText.replace('{item}', getRandomElement(Object.values(ITEMS).filter(i=>i.source?.includes('cornucopia'))).name);
            if(eventText.includes('{item2}')) eventText = eventText.replace('{item2}', getRandomElement(Object.values(ITEMS).filter(i=>i.source?.includes('cornucopia'))).name);
            events.push({ text: eventText, type: 'alliance', timestamp });

        } else if (actionRoll < 6) { // Negative event
            let eventText = getRandomElement(EVENTS.universal.allianceActions.negative)
                .replace('{alliance}', allianceName);
            if(eventText.includes('{name1}')) eventText = eventText.replace('{name1}', getRandomElement(allianceMembers).name);
            if(eventText.includes('{name2}')) eventText = eventText.replace('{name2}', getRandomElement(allianceMembers.filter(m => !eventText.includes(m.name))).name);
            events.push({ text: eventText, type: 'negative', timestamp });

            if(eventText.includes('splits up')) {
                const leaver = allianceMembers.find(m => eventText.includes(m.name));
                if (leaver) {
                    allianceMembers.forEach(m => {
                        m.allies = m.allies.filter(id => id !== leaver.id);
                    });
                    leaver.allies = [];
                    leaver.allianceName = undefined;
                    if (allianceMembers.length === 2) {
                        allianceMembers.filter(m => m.id !== leaver.id)[0].allianceName = undefined;
                    }
                }
            }

        } else { // Neutral event
            let eventText = getRandomElement(EVENTS.universal.allianceActions.neutral)
                .replace('{alliance}', allianceName);
            if(eventText.includes('{name1}')) eventText = eventText.replace('{name1}', getRandomElement(allianceMembers).name);
            if(eventText.includes('{name2}')) eventText = eventText.replace('{name2}', getRandomElement(allianceMembers.filter(m => !eventText.includes(m.name))).name);
            events.push({ text: eventText, type: 'neutral', timestamp });
        }
    });
};

const handleAllianceFormation = (
    tributes: Tribute[],
    allTributes: Tribute[],
    events: GameEvent[],
    timestamp: string
) => {
    for (let i = 0; i < tributes.length; i++) {
        const initiator = tributes[i];
        if (initiator.allies.length > 2 || hasTrait(initiator, 'Paranoid') || hasTrait(initiator, 'Arrogant')) continue;

        for (let j = i + 1; j < tributes.length; j++) {
            const target = tributes[j];
            if (target.allies.length > 2 || target.allies.includes(initiator.id)) continue;

            const initiatorPersonality = getPersonality(initiator);
            const targetPersonality = getPersonality(target);

            // Likelihood to form an alliance
            let chance = 5; // Base chance
            chance += getModifiedStats(initiator).charisma;
            if(initiatorPersonality === 'Charmer') chance += 5;
            if(targetPersonality === 'Career' && initiatorPersonality === 'Career') chance += 8;
            if(initiator.district === target.district) chance += 10;
            if (initiator.relationships[target.id] && initiator.relationships[target.id].score > 0) {
                 chance += Math.floor(initiator.relationships[target.id].score / 10);
            }

            if (roll() < chance) {
                initiator.allies.push(target.id);
                target.allies.push(initiator.id);
                updateRelationship(initiator, target.id, 40);
                updateRelationship(target, initiator.id, 40);
                events.push({ text: getRandomElement(EVENTS.universal.allianceForm).replace('{name1}', initiator.name).replace('{name2}', target.name), type: 'alliance', timestamp });
                break; // Initiator finds one ally for now
            }
        }
    }
};

const handleBetrayal = (
    tributes: Tribute[],
    allTributes: Tribute[],
    events: GameEvent[],
    deaths: { tributeName: string; tributeId: number; cause: string }[],
    timestamp: string
) => {
    tributes.forEach(tribute => {
        if (tribute.allies.length === 0) return;

        tribute.allies.forEach(allyId => {
            const ally = getTributeById(allTributes, allyId);
            if (!ally || ally.status !== 'alive') return;

            let betrayalChance = 2; // Base chance is low
            if (hasTrait(tribute, 'Unstable')) betrayalChance += 8;
            if (hasTrait(tribute, 'Short-tempered')) betrayalChance += 4;
            if (tribute.relationships[allyId] && tribute.relationships[allyId].score < -20) {
                betrayalChance += 10;
            }

            // If ally is weak, higher chance of betrayal
            if (ally.health < 40) betrayalChance += 5;
            
            if (roll() < betrayalChance) {
                events.push({ text: `${tribute.name} turns on their ally, ${ally.name}!`, type: 'betrayal', timestamp });
                
                // Simplified combat for betrayal, heavy advantage to attacker
                const tributePower = calculatePowerScore(tribute) + 20 + roll(); // Surprise bonus
                const allyPower = calculatePowerScore(ally) + roll();
                
                if (tributePower > allyPower) {
                    const cause = getRandomElement(DEATHS.betrayal).replace('{attacker}', tribute.name);
                    killTribute(ally, allTributes, deaths, cause, events, timestamp);
                    getTributeById(allTributes, tribute.id)!.kills++;
                } else {
                    ally.health -= 25;
                    updateRelationship(ally, tribute.id, -100);
                    updateRelationship(tribute, ally.id, -100);
                    events.push({ text: `${ally.name} manages to fight off the betrayal, but is wounded. The alliance is shattered.`, type: 'combat', timestamp });
                }
                
                // Break all alliance ties
                tribute.allies = tribute.allies.filter(id => id !== allyId);
                ally.allies = ally.allies.filter(id => id !== tribute.id);
            }
        });
    });
};


// --- Main Simulation Logic ---
export const generateDayReport = (
  initialTributes: Tribute[],
  day: number,
  arena: Arena,
  settings: { bloodbathDeaths: number }
): { updatedTributes: Tribute[]; dayReport: Omit<GameDay, 'day'> } => {
  // FIX: Explicitly type `allTributes` as Tribute[] to fix type errors from JSON.parse.
  const allTributes: Tribute[] = JSON.parse(JSON.stringify(initialTributes));
  const events: GameEvent[] = [];
  const deaths: { tributeName: string; tributeId: number; cause: string }[] = [];
  const summary = day === 1
    ? "The Cornucopia horn sounds, signaling the start of the bloody spectacle. Tributes either rush for supplies or flee into the wilderness."
    : `As a new day dawns, the remaining tributes face the harsh realities of the arena.`;

  let tributesToProcess = shuffleArray(allTributes.filter((t: Tribute) => t.status === 'alive'));

  // Bloodbath Logic for Day 1
  if (day === 1) {
    const bloodbathContestants = tributesToProcess.filter(t => {
      const personality = getPersonality(t);
      return personality === 'Career' || personality === 'Brute' || hasTrait(t, 'Reckless');
    });
    
    // Ensure some flee
    const nonContestants = tributesToProcess.filter(t => !bloodbathContestants.includes(t));
    nonContestants.slice(0, Math.max(2, nonContestants.length/2)).forEach(t => {
        events.push({ text: `${t.name} immediately flees the Cornucopia, disappearing into the arena.`, type: 'neutral', timestamp: '00:01' });
    });


    for (let i = 0; i < settings.bloodbathDeaths && bloodbathContestants.length >= 2; i++) {
        const [initiator, target] = shuffleArray(bloodbathContestants.filter(t => t.status === 'alive')).slice(0, 2);
        if (initiator && target) {
            resolveEncounter(initiator, target, allTributes, events, deaths, arena, `00:${i < 10 ? '0' : ''}${i+2}`, true);
        }
    }
  }

  // --- Daily Effects & Actions ---
  tributesToProcess = shuffleArray(allTributes.filter((t: Tribute) => t.status === 'alive'));
  
  tributesToProcess.forEach((tribute: Tribute) => {
    tribute.daysSurvived = day > 0 ? (tribute.daysSurvived || 0) + 1 : 0;
    
    // Vitals decrease
    tribute.food -= 10 + roll(5);
    tribute.water -= 12 + roll(5);

    if (tribute.food <= 0) {
        tribute.health -= 15;
        tribute.food = 0;
    }
    if (tribute.water <= 0) {
        tribute.health -= 20;
        tribute.water = 0;
    }

    if (tribute.health <= 0 && tribute.status === 'alive') {
        const cause = tribute.water <= 0 ? getRandomElement(DEATHS.environment.universal.filter(d => d.toLowerCase().includes('dehydration'))) : getRandomElement(DEATHS.environment.universal.filter(d => d.toLowerCase().includes('starvation')));
        killTribute(tribute, allTributes, deaths, cause, events, `06:00`);
    }
  });

  // Main Action Loop
  let hour = 8;
  const actionsPerDay = 3;
  for (let i = 0; i < actionsPerDay; i++) {
      tributesToProcess = shuffleArray(allTributes.filter((t: Tribute) => t.status === 'alive'));
      tributesToProcess.forEach((tribute: Tribute) => {
          if (tribute.status !== 'alive') return;
          
          const timestamp = `${hour < 10 ? '0' : ''}${hour}:${getRandomElement(['00', '15', '30', '45'])}`;
          
          // Trap check
          const trapChance = 4; // 15% chance
          if(roll() < trapChance) {
              handleTrapEncounter(tribute, allTributes, events, deaths, timestamp);
              if (tribute.status !== 'alive') return;
          }


          const { action, target, recipe } = selectTributeAction(tribute, tributesToProcess, arena, day);
          performAction(tribute, action, allTributes, events, deaths, arena, timestamp, { target, recipe });
          if (tribute.status !== 'alive') return;
          
          // Sponsor gift check
          checkForSponsorGift(tribute, events, timestamp);
      });
      hour += 4;
  }
  
  // Alliance, Betrayal, and Arena Events happen once per day in the evening
  const eveningTimestamp = '20:00';
  tributesToProcess = allTributes.filter((t: Tribute) => t.status === 'alive');
  
  if (tributesToProcess.length > 2) {
      handleAllianceActions(tributesToProcess, events, eveningTimestamp);
      handleAllianceFormation(tributesToProcess, allTributes, events, eveningTimestamp);
      handleBetrayal(tributesToProcess, allTributes, events, deaths, eveningTimestamp);
  }

  // Arena-specific event
  if (roll() > 14) { // 30% chance of a major arena event
    const eventPool = [...(EVENTS as any)[arena.name]?.arena || [], ...EVENTS.universal.arena];
    events.push({ text: getRandomElement(eventPool), type: 'arena', timestamp: '22:00' });
  }

  // Final check for deaths from delayed effects like poison
   allTributes.filter((t: Tribute) => t.status === 'alive' && t.health <= 0).forEach((t: Tribute) => {
       killTribute(t, allTributes, deaths, 'Succumbed to their injuries.', events, '23:00');
   });

  return { updatedTributes: allTributes, dayReport: { summary, events, deaths } };
};

export const triggerFinale = (
    tributes: Tribute[],
    arena: Arena
): { updatedTributes: Tribute[]; dayReport: Omit<GameDay, 'day'> } => {
    // FIX: Explicitly type `allTributes` as Tribute[] to fix type errors from JSON.parse.
    const allTributes: Tribute[] = JSON.parse(JSON.stringify(tributes));
    const events: GameEvent[] = [];
    const deaths: { tributeName: string; tributeId: number; cause: string }[] = [];
    const [tribute1, tribute2] = allTributes.filter((t: Tribute) => t.status === 'alive');
    
    const summary = `The arena falls silent. Only two tributes remain: ${tribute1.name} and ${tribute2.name}. The Gamemakers force them together for a final, decisive confrontation.`;

    if (tribute1 && tribute2) {
        // One final encounter to determine the winner
        resolveEncounter(tribute1, tribute2, allTributes, events, deaths, arena, "12:00");
        
        // If somehow both are still alive, one succumbs to injuries
        const stillAlive = allTributes.filter((t: Tribute) => t.status === 'alive');
        if (stillAlive.length > 1) {
            const loser = stillAlive.sort((a, b) => a.health - b.health)[0];
            killTribute(loser, allTributes, deaths, "Succumbed to their injuries after the final battle.", events, "12:30");
        }
    }
    
    return { updatedTributes: allTributes, dayReport: { summary, events, deaths } };
};

export const triggerSuddenDeath = (
    tributes: Tribute[],
    arena: Arena
): { updatedTributes: Tribute[]; dayReport: Omit<GameDay, 'day'> } => {
    // FIX: Explicitly type `allTributes` as Tribute[] to fix type errors from JSON.parse.
    const allTributes: Tribute[] = JSON.parse(JSON.stringify(tributes));
    const events: GameEvent[] = [];
    const deaths: { tributeName: string; tributeId: number; cause: string }[] = [];
    
    const summary = "The games have dragged on for too long. The Gamemakers initiate a sudden death event to force a conclusion, shrinking the arena and unleashing deadly mutts.";
    events.push({ text: "The borders of the arena begin to rapidly shrink, forcing all tributes towards the center!", type: 'arena', timestamp: "08:00" });

    let alive = allTributes.filter((t: Tribute) => t.status === 'alive');

    while (alive.length > 1) {
        const [tribute1, tribute2] = shuffleArray(alive).slice(0,2);
        if(!tribute1 || !tribute2) break;

        resolveEncounter(tribute1, tribute2, allTributes, events, deaths, arena, "10:00");

        alive = allTributes.filter((t: Tribute) => t.status === 'alive');
        if (alive.length <= 1) break;

        const muttVictim = shuffleArray(alive)[0];
        if (muttVictim) {
             const cause = `Was mauled to death by a pack of vicious muttations.`;
             killTribute(muttVictim, allTributes, deaths, cause, events, "14:00");
        }
        alive = allTributes.filter((t: Tribute) => t.status === 'alive');
    }
    
    return { updatedTributes: allTributes, dayReport: { summary, events, deaths } };
};

export const initializeRelationships = (tributes: Tribute[]): Tribute[] => {
    tributes.forEach(tribute => {
        tribute.relationships = {};
        tributes.forEach(other => {
            if (tribute.id !== other.id) {
                let score = 0;
                // District bond
                if (tribute.district === other.district) {
                    score = 25;
                }
                // Career pack bond
                const careerDistricts = [1, 2, 4];
                if (careerDistricts.includes(tribute.district) && careerDistricts.includes(other.district)) {
                    score = 15;
                }
                tribute.relationships[other.id] = {
                    score: score,
                    level: getRelationshipLevelFromScore(score),
                };
            }
        });
    });
    return tributes;
};

export const generateTrainingDayReport = (initialTributes: Tribute[]): { updatedTributes: Tribute[]; dayReport: Omit<GameDay, 'day'> } => {
    // FIX: Explicitly type `allTributes` as Tribute[] to fix type errors from JSON.parse.
    const allTributes: Tribute[] = JSON.parse(JSON.stringify(initialTributes));
    const events: GameEvent[] = [];
    const summary = "The tributes spend their final days before the games in the training center, honing their skills and forming tentative bonds—or rivalries.";
    
    for(let i=0; i<5; i++) {
        const tributePool = shuffleArray(allTributes);
        const eventTemplate = getRandomElement(EVENTS.training);
        let eventText = eventTemplate;
        if(eventTemplate.includes('{name1}')) eventText = eventText.replace('{name1}', tributePool[0].name);
        if(eventTemplate.includes('{name2}')) eventText = eventText.replace('{name2}', tributePool[1].name);
        if(eventTemplate.includes('{name3}')) eventText = eventText.replace('{name3}', tributePool[2].name);
        if(eventTemplate.includes('{district}')) eventText = eventText.replace('{district}', tributePool[0].district.toString());
        if(eventTemplate.includes('{skill}')) eventText = eventText.replace('{skill}', tributePool[0].skills[0]?.name || 'combat');
        if(eventTemplate.includes('{weapon}')) eventText = eventText.replace('{weapon}', getRandomElement(Object.values(ITEMS).filter(i=>i.type === 'weapon')).name);
        events.push({ text: eventText, type: 'neutral', timestamp: `Day ${i-3}`});
    }

    // Some tributes get a small random stat boost/nerf from training
    shuffleArray(allTributes).slice(0, 5).forEach(tribute => {
        const stats: (keyof Tribute)[] = ['strength', 'agility', 'speed', 'intelligence', 'charisma'];
        const statToChange = getRandomElement(stats);
        const statChange = roll(3) > 1 ? 1 : -1;

        if (typeof tribute[statToChange] === 'number') {
            const currentValue = tribute[statToChange] as number;
            if(statChange > 0 && currentValue < 10) {
                 (tribute[statToChange] as number)++;
                 events.push({text: `${tribute.name} showed great promise in training, improving their ${statToChange}.`, type: 'positive', timestamp: 'Evaluation'});
            } else if (statChange < 0 && currentValue > 1) {
                 (tribute[statToChange] as number)--;
                 events.push({text: `${tribute.name} struggled in training, showing weakness in their ${statToChange}.`, type: 'negative', timestamp: 'Evaluation'});
            }
        }
    });


    return { updatedTributes: allTributes, dayReport: { summary, events, deaths: [] } };
};


export const cullTributesForFinale = (
    aliveTributes: Tribute[], 
    targetCount: number, 
    arena: Arena,
    allTributes: Tribute[]
): { updatedTributes: Tribute[]; dayReport: Omit<GameDay, 'day'> } => {
    const events: GameEvent[] = [];
    const deaths: { tributeName: string; tributeId: number; cause: string }[] = [];
    const summary = "To expedite the finale, the Gamemakers unleash a swift and brutal culling of the weakest tributes.";
    
    const tributesToCull = aliveTributes
        .sort((a, b) => calculatePowerScore(a) - calculatePowerScore(b))
        .slice(0, aliveTributes.length - targetCount);

    tributesToCull.forEach((tribute, i) => {
        const cause = getRandomElement([
            `Was eliminated by a targeted Gamemaker trap.`,
            `Cornered and killed by a pack of mutts released by the Gamemakers.`,
            `Died in a sudden, localized arena event engineered by the Gamemakers.`
        ]);
        const timestamp = `18:${i < 10 ? '0' : ''}${i+1}`;
        killTribute(tribute, allTributes, deaths, cause, events, timestamp);
    });

    return { updatedTributes: allTributes, dayReport: { summary, events, deaths }};
};
