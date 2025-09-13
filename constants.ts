
import type { Item, Tribute, Skill, Trait, Arena } from './types';

// New Arena Objects
export const ARENAS: Arena[] = [
    {
        name: "Random",
        type: "random",
        description: "The Gamemakers will select a random arena for this year's games.",
        effects: []
    },
    {
        name: "Temperate Forest",
        type: "forest",
        description: "A classic arena. A dense, sprawling forest with a mix of pine and deciduous trees, a central lake, and several rivers. Survival skills are key.",
        effects: [
            { districts: [7, 11], buffs: { intelligence: 1 }, description: "D7 (Lumber) & D11 (Agriculture) tributes are more at home here, gaining +1 Intelligence." },
            { districts: [3], nerfs: { speed: 1 }, description: "D3 (Technology) tributes find the terrain difficult, losing -1 Speed." }
        ]
    },
    {
        name: "Scorching Desert",
        type: "desert",
        description: "An unforgiving wasteland of sand dunes and rocky canyons. Water is extremely scarce, and the blistering sun is as dangerous as any tribute.",
        effects: [
            { districts: [5, 10], buffs: { strength: 1 }, description: "D5 (Power) & D10 (Livestock) tributes are used to harsh conditions, gaining +1 Strength." },
            { districts: [4], nerfs: { agility: 1 }, description: "D4 (Fishing) tributes are out of their element, losing -1 Agility." }
        ]
    },
    {
        name: "Tropical Jungle",
        type: "jungle",
        description: "A humid, dense jungle teeming with life, both beautiful and deadly. Hidden dangers lurk behind every corner, from poisonous creatures to carnivorous plants.",
        effects: [
            { districts: [4, 11], buffs: { agility: 1 }, description: "D4 (Fishing) & D11 (Agriculture) tributes move easily through the dense foliage, gaining +1 Agility." },
            { districts: [2, 6], nerfs: { strength: 1 }, description: "D2 (Masonry) & D6 (Transportation) tributes are hampered by the environment, losing -1 Strength." }
        ]
    },
    {
        name: "Frozen Tundra",
        type: "tundra",
        description: "A vast, icy expanse where temperatures plummet to lethal lows. Shelter and warmth are the most valuable resources.",
        effects: [
            { districts: [2, 12], buffs: { strength: 1 }, description: "D2 (Masonry) & D12 (Mining) tributes have a resilience to cold, gaining +1 Strength." },
            { districts: [8, 11], nerfs: { speed: 1 }, description: "D8 (Textiles) & D11 (Agriculture) tributes are unprepared for the cold, losing -1 Speed." }
        ]
    },
    {
        name: "Decaying Urban Ruins",
        type: "urban",
        description: "The skeletal remains of a city. Collapsing buildings, treacherous rubble, and dark subway tunnels provide ample opportunities for traps and ambushes.",
        effects: [
            { districts: [3, 6], buffs: { intelligence: 1 }, description: "D3 (Technology) & D6 (Transportation) tributes can navigate the ruins, gaining +1 Intelligence." },
            { districts: [7, 11], nerfs: { charisma: 1 }, description: "D7 (Lumber) & D11 (Agriculture) tributes are unnerved by the urban decay, losing -1 Charisma." }
        ]
    },
    {
        name: "Mountain Range",
        type: "mountain",
        description: "A series of jagged peaks and sheer cliffs. The high altitude makes breathing difficult, and rockslides are a constant threat.",
        effects: [
            { districts: [2, 12], buffs: { agility: 1 }, description: "D2 (Masonry) & D12 (Mining) tributes are sure-footed climbers, gaining +1 Agility." },
            { districts: [4, 10], nerfs: { speed: 1 }, description: "D4 (Fishing) & D10 (Livestock) tributes struggle with the altitude, losing -1 Speed." }
        ]
    },
    {
        name: "Swampy Marshlands",
        type: "swamp",
        description: "A murky bog of stagnant water and tangled mangroves. The air is thick with insects, and dangerous creatures lurk beneath the surface.",
        effects: [
            { districts: [4, 9], buffs: { intelligence: 1 }, description: "D4 (Fishing) & D9 (Grain) tributes know how to live off the land, gaining +1 Intelligence." },
            { districts: [1], nerfs: { charisma: 1 }, description: "D1 (Luxury) tributes find the filth unbearable, losing -1 Charisma." }
        ]
    },
];

export const SKILLS: { [key: string]: Skill } = {
    // Combat
    assassin: { name: 'Assassin', description: 'Deals bonus damage when initiating an attack.', type: 'passive' },
    brawler: { name: 'Brawler', description: 'Higher chance to win unarmed or melee encounters.', type: 'passive' },
    marksman: { name: 'Marksman', description: 'Excels with ranged weapons like bows and throwing knives.', type: 'passive' },
    fortified: { name: 'Fortified', description: 'Takes reduced damage from attacks.', type: 'passive' },
    berserker: { name: 'Berserker', description: 'Deals more damage as health gets lower.', type: 'passive' },
    ambusher: { name: 'Ambusher', description: 'Greatly increased chance of a successful surprise attack.', type: 'passive' },

    // Survival
    survivalist: { name: 'Survivalist', description: 'Greatly increased chance of finding food and water.', type: 'passive' },
    medic: { name: 'Medic', description: 'Healing items are 50% more effective.', type: 'passive' },
    scavenger: { name: 'Scavenger', description: 'Higher chance to find useful items and sponsor gifts.', type: 'passive' },
    stealth: { name: 'Stealth', description: 'Less likely to be detected or ambushed.', type: 'passive' },
    gourmand: { name: 'Gourmand', description: 'Receives 25% more sustenance from food items.', type: 'passive' },
    naturalist: { name: 'Naturalist', description: 'Can identify and avoid poisonous plants, and has a higher chance of finding medicinal herbs.', type: 'passive' },

    // Utility/Intellect
    technologist: { name: 'Technologist', description: 'Can craft advanced items and is better at avoiding Gamemaker traps.', type: 'passive' },
    charismatic: { name: 'Charismatic', description: 'More likely to successfully form alliances and receive sponsor gifts.', type: 'passive' },
    sprinter: { name: 'Sprinter', description: 'High chance to successfully flee from a disadvantageous fight.', type: 'passive' },
    trapper: { name: 'Trapper', description: 'Can occasionally craft a trap at their location, which might harm another tribute.', type: 'active' },
    camouflage: { name: 'Camouflage', description: 'Greatly increased chance to hide successfully and avoid encounters.', type: 'passive' },
    pharmacist: { name: 'Pharmacist', description: 'Can identify medicinal herbs and poisonous plants, avoiding negative events and having a higher chance of finding healing items.', type: 'passive' },
    intimidating: { name: 'Intimidating', description: 'Lower chance of being attacked, higher chance of opponents fleeing.', type: 'passive' },
    resourceful: { name: 'Resourceful', description: 'Higher chance to successfully craft items, even with lower intelligence.', type: 'passive' },
};

export const TRAITS: { [key: string]: Trait } = {
    clumsy: { name: 'Clumsy', description: 'Higher chance of accidents and fumbling during combat or exploration.', type: 'negative' },
    arrogant: { name: 'Arrogant', description: 'More likely to underestimate opponents and reject alliances.', type: 'negative' },
    cowardly: { name: 'Cowardly', description: 'Will almost always attempt to flee from combat, even with an advantage.', type: 'negative' },
    paranoid: { name: 'Paranoid', description: 'Wastes time and energy on perceived threats, less likely to form alliances.', type: 'negative' },
    reckless: { name: 'Reckless', description: 'Prone to rushing into dangerous situations without thinking.', type: 'negative' },
    unstable: { name: 'Unstable', description: 'Unpredictable. Might betray allies or attack without provocation.', type: 'negative' },
    loud: { name: 'Loud', description: 'Higher chance of attracting unwanted attention from other tributes or mutts.', type: 'negative' },
    trusting: { name: 'Trusting', description: 'More likely to accept alliance offers, but also more susceptible to betrayal.', type: 'negative' },
    weak_stomach: { name: 'Weak Stomach', description: 'Higher chance of getting sick from foraged food.', type: 'negative' },
    short_tempered: { name: 'Short-tempered', description: 'Prone to starting fights over minor issues, may attack allies.', type: 'negative' },
    overconfident: { name: 'Overconfident', description: 'More likely to initiate fights against opponents who are stronger than them.', type: 'negative'},
    vain: { name: 'Vain', description: 'May neglect critical survival tasks in favor of maintaining their appearance.', type: 'negative'},
    illiterate: { name: 'Illiterate', description: 'May misinterpret or be unable to use complex items or sponsor gifts that require reading.', type: 'negative'},
};


export const ITEMS: { [key: string]: Item } = {
    // Basic Weapons
    rock: { name: "Rock", type: "weapon", effect: { damage: 5 }, source: ['foraged'] },
    sharpened_stick: { name: "Sharpened Stick", type: "weapon", effect: { damage: 8 }, source: ['built'], craftable: true },
    knife: { name: "Knife", type: "weapon", effect: { damage: 15 }, source: ['cornucopia'] },
    spear: { name: "Spear", type: "weapon", effect: { damage: 20 }, source: ['cornucopia', 'built'], craftable: true },
    bow: { name: "Bow and Arrow", type: "weapon", effect: { damage: 25 }, source: ['cornucopia'] },
    sword: { name: "Sword", type: "weapon", effect: { damage: 22 }, source: ['cornucopia'] },
    mace: { name: "Mace", type: "weapon", effect: { damage: 18 }, source: ['cornucopia'] },
    axe: { name: "Axe", type: "weapon", effect: { damage: 24 }, source: ['cornucopia'] },
    slingshot: { name: "Slingshot", type: "weapon", effect: { damage: 10 }, source: ['cornucopia', 'built'], craftable: true },
    club: { name: "Club", type: "weapon", effect: { damage: 12 }, source: ['cornucopia', 'built'], craftable: true },
    machete: { name: "Machete", type: "weapon", effect: { damage: 18 }, source: ['cornucopia'] },
    trident: { name: "Trident", type: "weapon", effect: { damage: 23 }, source: ['cornucopia'] },
    throwing_knives: { name: "Throwing Knives", type: "weapon", effect: { damage: 16 }, source: ['cornucopia'] },
    net: { name: "Net", type: "weapon", effect: { damage: 2 }, source: ['cornucopia', 'built'], craftable: true },
    poisoned_berries: { name: "Poisoned Berries", type: "weapon", effect: { damage: 30 }, source: ['foraged']},

    // Food & Water
    berries: { name: "Handful of Berries", type: "food", effect: { food: 20 }, source: ['foraged'] },
    bread: { name: "Loaf of Bread", type: "food", effect: { food: 40 }, source: ['cornucopia'] },
    cannedFood: { name: "Canned Food", type: "food", effect: { food: 50 }, source: ['cornucopia'] },
    driedFruit: { name: "Dried Fruit", type: "food", effect: { food: 30 }, source: ['cornucopia'] },
    hunted_rabbit: { name: "Hunted Rabbit", type: "food", effect: { food: 45 }, source: ['foraged'] },
    fish: { name: "Fish", type: "food", effect: { food: 35 }, source: ['foraged'] },
    canteen: { name: "Full Canteen", type: "water", effect: { water: 50 }, source: ['cornucopia'] },
    waterTablets: { name: "Water Purification Tablets", type: "utility", effect: { water: 60 }, source: ['cornucopia'] },

    // Medicine
    medicine: { name: "Small First-Aid Kit", type: "medicine", effect: { healing: 30 }, source: ['cornucopia'] },
    bandages: { name: "Bandages", type: "medicine", effect: { healing: 15 }, source: ['cornucopia'] },
    medicinal_herbs: { name: "Medicinal Herbs", type: "medicine", effect: { healing: 20 }, source: ['foraged'] },
    
    // Materials
    sturdy_branch: { name: "Sturdy Branch", type: "material", effect: {}, source: ['foraged'] },
    sharp_rock: { name: "Sharp Rock", type: "material", effect: {}, source: ['foraged'] },
    vine: { name: "Vine", type: "material", effect: {}, source: ['foraged'] },
    flint: { name: "Flint", type: "material", effect: {}, source: ['foraged'] },
    metal_scrap: { name: "Metal Scrap", type: "material", effect: {}, source: ['foraged'] },

    // Utility
    rope: { name: "Rope", type: "utility", effect: {}, source: ['cornucopia', 'built'], craftable: true },
    backpack: { name: "Backpack", type: "utility", effect: {}, source: ['cornucopia'] },
    sleeping_bag: { name: "Sleeping Bag", type: "utility", effect: {}, source: ['cornucopia'] },
    matches: { name: "Matches", type: "utility", effect: {}, source: ['cornucopia'] },
};

export const RECIPES = [
    { result: 'sharpened_stick', components: ['sturdy_branch', 'sharp_rock'], intelligenceThreshold: 2 },
    { result: 'spear', components: ['sharpened_stick', 'vine'], intelligenceThreshold: 4 },
    { result: 'club', components: ['sturdy_branch'], intelligenceThreshold: 1 },
    { result: 'slingshot', components: ['sturdy_branch', 'vine'], intelligenceThreshold: 5 },
    { result: 'rope', components: ['vine', 'vine'], intelligenceThreshold: 3},
    { result: 'net', components: ['rope', 'vine'], intelligenceThreshold: 6}
];

// Base data for book characters with assigned attributes and skills
const BOOK_TRIBUTES_DATA = [
    { name: "Marvel", district: 1, gender: 'Male', strength: 8, agility: 7, speed: 7, intelligence: 5, charisma: 6, skills: [SKILLS.marksman, SKILLS.brawler], traits: [] },
    { name: "Glimmer", district: 1, gender: 'Female', strength: 6, agility: 8, speed: 6, intelligence: 6, charisma: 8, skills: [SKILLS.marksman, SKILLS.charismatic], traits: [TRAITS.arrogant, TRAITS.vain] },
    { name: "Cato", district: 2, gender: 'Male', strength: 10, agility: 7, speed: 7, intelligence: 5, charisma: 5, skills: [SKILLS.brawler, SKILLS.berserker], traits: [TRAITS.reckless, TRAITS.short_tempered] },
    { name: "Clove", district: 2, gender: 'Female', strength: 7, agility: 9, speed: 8, intelligence: 7, charisma: 6, skills: [SKILLS.assassin, SKILLS.marksman], traits: [] },
    { name: "Tribute Boy D3", district: 3, gender: 'Male', strength: 4, agility: 5, speed: 5, intelligence: 9, charisma: 4, skills: [SKILLS.technologist, SKILLS.trapper], traits: [] },
    { name: "Tribute Girl D3", district: 3, gender: 'Female', strength: 3, agility: 6, speed: 6, intelligence: 8, charisma: 5, skills: [SKILLS.technologist, SKILLS.stealth], traits: [] },
    { name: "Tribute Boy D4", district: 4, gender: 'Male', strength: 7, agility: 7, speed: 7, intelligence: 6, charisma: 7, skills: [SKILLS.brawler, SKILLS.survivalist], traits: [] },
    { name: "Tribute Girl D4", district: 4, gender: 'Female', strength: 6, agility: 8, speed: 8, intelligence: 7, charisma: 7, skills: [SKILLS.assassin, SKILLS.sprinter], traits: [] },
    { name: "Foxface", district: 5, gender: 'Female', strength: 4, agility: 9, speed: 10, intelligence: 10, charisma: 3, skills: [SKILLS.stealth, SKILLS.sprinter, SKILLS.scavenger], traits: [TRAITS.paranoid] },
    { name: "Tribute Boy D5", district: 5, gender: 'Male', strength: 5, agility: 6, speed: 5, intelligence: 5, charisma: 5, skills: [SKILLS.scavenger], traits: [] },
    { name: "Tribute Boy D6", district: 6, gender: 'Male', strength: 6, agility: 5, speed: 5, intelligence: 4, charisma: 4, skills: [SKILLS.fortified], traits: [] },
    { name: "Tribute Girl D6", district: 6, gender: 'Female', strength: 5, agility: 6, speed: 6, intelligence: 5, charisma: 5, skills: [SKILLS.medic], traits: [] },
    { name: "Tribute Boy D7", district: 7, gender: 'Male', strength: 7, agility: 6, speed: 6, intelligence: 4, charisma: 3, skills: [SKILLS.brawler], traits: [] },
    { name: "Tribute Girl D7", district: 7, gender: 'Female', strength: 6, agility: 7, speed: 7, intelligence: 5, charisma: 4, skills: [SKILLS.survivalist], traits: [] },
    { name: "Tribute Boy D8", district: 8, gender: 'Male', strength: 5, agility: 5, speed: 5, intelligence: 6, charisma: 6, skills: [SKILLS.trapper], traits: [] },
    { name: "Tribute Girl D8", district: 8, gender: 'Female', strength: 4, agility: 6, speed: 7, intelligence: 7, charisma: 7, skills: [SKILLS.charismatic], traits: [] },
    { name: "Tribute Boy D9", district: 9, gender: 'Male', strength: 6, agility: 5, speed: 4, intelligence: 3, charisma: 3, skills: [SKILLS.fortified], traits: [TRAITS.illiterate] },
    { name: "Tribute Girl D9", district: 9, gender: 'Female', strength: 5, agility: 6, speed: 5, intelligence: 4, charisma: 4, skills: [SKILLS.survivalist], traits: [] },
    { name: "Tribute Boy D10", district: 10, gender: 'Male', strength: 7, agility: 4, speed: 4, intelligence: 3, charisma: 3, skills: [SKILLS.brawler], traits: [] },
    { name: "Tribute Girl D10", district: 10, gender: 'Female', strength: 6, agility: 5, speed: 5, intelligence: 4, charisma: 4, skills: [SKILLS.fortified], traits: [] },
    { name: "Thresh", district: 11, gender: 'Male', strength: 10, agility: 6, speed: 6, intelligence: 6, charisma: 4, skills: [SKILLS.brawler, SKILLS.fortified, SKILLS.intimidating], traits: [] },
    { name: "Rue", district: 11, gender: 'Female', strength: 3, agility: 10, speed: 9, intelligence: 8, charisma: 8, skills: [SKILLS.stealth, SKILLS.medic, SKILLS.survivalist], traits: [] },
    { name: "Peeta Mellark", district: 12, gender: 'Male', strength: 8, agility: 5, speed: 4, intelligence: 7, charisma: 9, skills: [SKILLS.charismatic, SKILLS.fortified, SKILLS.resourceful], traits: [] },
    { name: "Katniss Everdeen", district: 12, gender: 'Female', strength: 6, agility: 9, speed: 8, intelligence: 8, charisma: 7, skills: [SKILLS.marksman, SKILLS.survivalist, SKILLS.camouflage], traits: [] },
];

// --- New Tribute Generation Logic ---

type TributeStats = Pick<Tribute, 'strength' | 'agility' | 'speed' | 'intelligence' | 'charisma'>;

interface DistrictProfile {
    name: string;
    isCareer: boolean;
    bias: (keyof TributeStats)[];
    weakness?: (keyof TributeStats)[];
    skillPool: Skill[];
    traitPool: Trait[];
}

const DISTRICT_PROFILES: { [key: number]: DistrictProfile } = {
    1: { name: "Luxury", isCareer: true, bias: ['charisma', 'agility', 'speed'], skillPool: [SKILLS.charismatic, SKILLS.marksman, SKILLS.assassin], traitPool: [TRAITS.arrogant, TRAITS.short_tempered, TRAITS.vain]},
    2: { name: "Masonry", isCareer: true, bias: ['strength', 'agility'], skillPool: [SKILLS.brawler, SKILLS.fortified, SKILLS.assassin, SKILLS.berserker, SKILLS.intimidating], traitPool: [TRAITS.reckless, TRAITS.overconfident]},
    3: { name: "Technology", isCareer: false, bias: ['intelligence'], weakness: ['strength', 'charisma'], skillPool: [SKILLS.technologist, SKILLS.trapper, SKILLS.stealth, SKILLS.resourceful], traitPool: [TRAITS.paranoid, TRAITS.illiterate]},
    4: { name: "Fishing", isCareer: true, bias: ['strength', 'agility', 'speed'], skillPool: [SKILLS.survivalist, SKILLS.marksman, SKILLS.brawler], traitPool: []},
    5: { name: "Power", isCareer: false, bias: ['intelligence', 'strength'], skillPool: [SKILLS.scavenger, SKILLS.technologist, SKILLS.fortified], traitPool: [TRAITS.reckless]},
    6: { name: "Transportation", isCareer: false, bias: ['speed', 'strength'], skillPool: [SKILLS.sprinter, SKILLS.fortified], traitPool: [TRAITS.clumsy, TRAITS.loud]},
    7: { name: "Lumber", isCareer: false, bias: ['strength'], weakness: ['charisma', 'intelligence'], skillPool: [SKILLS.brawler, SKILLS.fortified, SKILLS.survivalist], traitPool: []},
    8: { name: "Textiles", isCareer: false, bias: ['agility', 'intelligence'], skillPool: [SKILLS.stealth, SKILLS.trapper, SKILLS.camouflage, SKILLS.ambusher], traitPool: [TRAITS.cowardly]},
    9: { name: "Grain", isCareer: false, bias: ['strength'], skillPool: [SKILLS.survivalist, SKILLS.fortified, SKILLS.gourmand], traitPool: [TRAITS.weak_stomach]},
    10: { name: "Livestock", isCareer: false, bias: ['strength', 'speed'], weakness: ['intelligence'], skillPool: [SKILLS.brawler, SKILLS.survivalist, SKILLS.intimidating], traitPool: []},
    11: { name: "Agriculture", isCareer: false, bias: ['strength', 'intelligence'], weakness: ['charisma'], skillPool: [SKILLS.medic, SKILLS.survivalist, SKILLS.stealth, SKILLS.pharmacist, SKILLS.naturalist], traitPool: [TRAITS.trusting]},
    12: { name: "Mining", isCareer: false, bias: ['strength', 'agility'], weakness: ['charisma'], skillPool: [SKILLS.scavenger, SKILLS.stealth, SKILLS.medic, SKILLS.camouflage, SKILLS.ambusher], traitPool: [TRAITS.unstable, TRAITS.trusting]}
};

const generateTributeTraits = (district: number): Trait[] => {
    const profile = DISTRICT_PROFILES[district];
    if(!profile) return [];
    
    const assignedTraits: Trait[] = [];
    const chance = profile.isCareer ? 0.25 : 0.15;

    if(Math.random() < chance) {
        const traitPool = [...profile.traitPool, ...Object.values(TRAITS)];
        assignedTraits.push(traitPool[Math.floor(Math.random() * traitPool.length)])
    }
    return assignedTraits;
}

const generateTributeSkills = (district: number): Skill[] => {
    const profile = DISTRICT_PROFILES[district];
    if (!profile) return [];
    
    const assignedSkills = new Set<Skill>();
    const pool = [...profile.skillPool];

    if (profile.isCareer) {
        // Careers get two skills, small chance for a third.
        while (assignedSkills.size < 2 && pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const selectedSkill = pool.splice(randomIndex, 1)[0];
            assignedSkills.add(selectedSkill);
        }
        if (Math.random() < 0.1) { // 10% chance for a third skill
             const allSkills = Object.values(SKILLS);
             const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
             if (assignedSkills.size < 3) {
                assignedSkills.add(randomSkill);
             }
        }
    } else {
        // Non-careers have a chance for skills
        if (Math.random() < 0.65) { // 65% chance for one skill
            if (pool.length > 0) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                const selectedSkill = pool.splice(randomIndex, 1)[0];
                assignedSkills.add(selectedSkill);
            }
        }
        if (Math.random() < 0.1) { // 10% chance for a second skill
             const allSkills = Object.values(SKILLS);
             const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
             if (assignedSkills.size < 2) {
                assignedSkills.add(randomSkill);
             }
        }
    }
    
    return Array.from(assignedSkills);
};

const generateTributeStats = (district: number): TributeStats => {
    const profile = DISTRICT_PROFILES[district];
    if (!profile) return { strength: 5, agility: 5, speed: 5, intelligence: 5, charisma: 5 };
    
    const totalPoints = profile.isCareer ? 38 : 30;
    
    const stats: TributeStats = { strength: 1, agility: 1, speed: 1, intelligence: 1, charisma: 1 };
    const statKeys = Object.keys(stats) as (keyof TributeStats)[];
    let pointsToDistribute = totalPoints - statKeys.length;

    const weightedPool: (keyof TributeStats)[] = [];
    statKeys.forEach(key => {
        let weight = 3; 
        if (profile.bias.includes(key)) weight += 4;
        if (profile.weakness?.includes(key)) weight = Math.max(1, weight - 2);
        for (let i = 0; i < weight; i++) weightedPool.push(key);
    });

    while (pointsToDistribute > 0) {
        const statToUpgrade = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        if (stats[statToUpgrade] < 10) {
            stats[statToUpgrade]++;
            pointsToDistribute--;
        }
    }

    const shuffles = 2;
    for(let i=0; i < shuffles; i++) {
        const statToDecrement = statKeys[Math.floor(Math.random() * statKeys.length)];
        const statToIncrement = statKeys[Math.floor(Math.random() * statKeys.length)];

        if(statToDecrement !== statToIncrement && stats[statToDecrement] > 2 && stats[statToIncrement] < 10){
            stats[statToDecrement]--;
            stats[statToIncrement]++;
        }
    }
    return stats;
};

const generateGenericTributes = () => {
    const tributes = [];
    for (let d = 1; d <= 12; d++) {
        tributes.push({ name: `District ${d} Boy`, district: d, gender: 'Male', ...generateTributeStats(d), skills: generateTributeSkills(d), traits: generateTributeTraits(d) });
        tributes.push({ name: `District ${d} Girl`, district: d, gender: 'Female', ...generateTributeStats(d), skills: generateTributeSkills(d), traits: generateTributeTraits(d) });
    }
    return tributes;
};

export const TRIBUTE_SETS = {
    book: BOOK_TRIBUTES_DATA,
    generic: () => generateGenericTributes(),
};


export const ALLIANCE_ADJECTIVES = ["Strong", "Swift", "Cunning", "Shadowy", "Final", "Unlikely", "Desperate", "Career"];
export const ALLIANCE_NOUNS = ["Pact", "Alliance", "Union", "Coalition", "Circle", "Hunters", "Survivors", "Wolves"];

// More detailed events
export const EVENTS = {
    day: {
        positive: [
            "{name} feels energized by the warm sunlight, recovering a little morale.",
            "{name} spots a predator from afar in the clear daylight and easily avoids it.",
        ],
        negative: [
            "{name} is temporarily blinded by the sun's glare, losing their bearings.",
            "{name} gets a nasty sunburn, causing a minor injury.",
        ]
    },
    night: {
        positive: [
            "{name} uses the darkness to travel unseen.",
            "{name} finds a moment of peace under the starry sky, recovering some morale.",
        ],
        negative: [
            "{name} is startled by a sound in the darkness, losing morale.",
            "A sudden drop in temperature at night leaves {name} shivering and weak.",
        ],
        lethal: [
            "{name} is ambushed by a nocturnal predator and suffers a fatal injury.",
            "{name} freezes to death in the cold night.",
            "{name} stumbles in the dark and falls into a ravine.",
        ]
    },
    training: [
        "{name1} and {name2} bond over their shared district origins.",
        "The Career tributes form a powerful alliance, sizing up the competition.",
        "{name1} impresses sponsors with their skill in {skill}.",
        "{name1} gets into a heated argument with {name2} at the training center.",
        "{name1}, {name2}, and {name3} form a tentative friendship.",
        "{name1} watches {name2} from afar, marking them as a threat.",
        "The tributes from District {district} vow to protect each other.",
        "{name1} tries to form an alliance with {name2}, but is rebuffed.",
        "{name1} shows unexpected proficiency with the {weapon}, surprising the other tributes."
    ],
    universal: {
        positive: [
            "{name} discovers a hidden spring and replenishes their water.",
            "{name} finds a backpack containing a {item}.",
            "{name} finds a sponsor gift: a {item}.",
            "{name} tends to their wounds, recovering some health.",
            "Thanks to their charisma, {name} receives a sponsor gift of {item}.",
            "Using their speed, {name} quickly scouts the area and finds a hidden cache with a {item}.",
            "{name} finds a well-hidden cave, providing excellent shelter.",
            "{name} feels a sudden burst of confidence, improving their morale.",
            "{name} shares some of their food with {name2}, strengthening their bond.",
            "{name} gets a good night's sleep in a secure location, recovering significant health.",
            "{name} manages to treat a nagging injury, recovering some health.",
            "{name} feels revitalized after a nutritious meal.",
            "{name} discovers a patch of medicinal herbs and crafts a healing salve, recovering significant health.",
            "{name} spends the day meditating, clearing their mind. They feel focused and gain 1 intelligence.",
            "{name} discovers the remains of a former tribute's camp and scavenges a {item}.",
            "The weather is clear and calm, boosting {name}'s morale.",
            "A beautiful sunrise gives {name} a glimmer of hope.",
            "{name}'s training pays off as they easily scale a difficult rock face.",
            "{name} successfully identifies a set of tracks, gaining valuable information about another tribute's location.",
        ],
        neutral: [
            "{name} camouflages a shelter, feeling a sense of security.",
            "{name} spends the day honing their survival skills.",
            "{name} feels a surge of adrenaline and determination, ready for what's next.",
            "{name} discovers a vantage point and spends time observing the arena.",
            "{name} practices with their weapon, feeling more confident.",
            "{name} manages to get a good night's sleep, recovering some energy.",
            "{name} recalls a piece of advice from their mentor, boosting their morale.",
            "{name} spends time scouting the area, noting potential hiding spots and dangers.",
            "{name} creates a small display with foliage, hoping to catch the eye of a sponsor.",
            "{name} finds and destroys an abandoned shelter in a fit of rage.",
            "{name} spends the day meticulously cleaning their weapon.",
            "{name} climbs a tall tree to get a better view of the arena.",
            "{name} thinks about home, wondering if they'll ever return.",
            "{name} and {name2} have a brief, tense standoff before going their separate ways.",
            "{name} stalks {name2} for a while, but decides not to attack.",
            "{name} daydreams for a while, losing track of time.",
            "{name} hums a tune from their home district.",
            "{name} tries to identify constellations in the night sky.",
            "{name} sees another tribute from a distance but chooses to hide.",
            "{name} builds a small memorial for the fallen tribute from their district.",
            "{name} sees smoke in the distance and decides to investigate, but finds nothing.",
            "{name} spends hours weaving a basket from reeds.",
            "{name} follows a game trail for miles, but it leads nowhere.",
            "A heavy fog rolls in, reducing visibility.",
            "The temperature drops suddenly, forcing {name} to find warmth.",
            "{name} watches the sky for sponsor drones, but none appear.",
            "{name} spends some time trying to decipher the Gamemakers' strategy.",
            "{name} finds strange markings on a tree and wonders what they mean.",
        ],
        negative: [
            "{name} accidentally consumes poisonous berries and becomes violently ill.",
            "{name} twists their ankle while navigating treacherous terrain, suffering a moderate injury and losing 1 speed.",
            "{name} is plagued by nightmares and gets no rest, losing valuable energy and morale.",
            "{name} drops their primary weapon in a fast-moving river, losing it.",
            "{name} triggers a trap, but manages to escape with minor injuries.",
            "{name}'s food supplies spoil, losing half their food.",
            "{name} overexerts themselves, suffering from exhaustion and losing 1 strength.",
            "{name}'s arrogance angers the sponsors, who refuse to send any aid.",
            "{name} makes a clumsy mistake, attracting unwanted attention.",
            "{name} is overcome with paranoia, wasting time checking for threats that aren't there.",
            "{name}'s shelter is destroyed by a storm, leaving them exposed.",
            "{name} gets a deep cut while foraging, it might get infected.",
            "{name} is haunted by the face of a tribute they killed, losing sleep and a significant amount of morale.",
            "A swarm of insects relentlessly attacks {name}, causing minor injuries and exhaustion.",
            "{name} gets caught in a sudden downpour and shivers uncontrollably, weakening them.",
            "{name} is startled by a loud noise and drops their primary weapon, losing it.",
            "{name} steals supplies from {name2} while they are sleeping.",
            "{name}'s loud noises attract a predator, forcing them to flee and lose energy.",
            "{name}'s temper flares, starting a pointless fight with {name2} over nothing.",
            "{name} feels a wave of despair, weakening their resolve and dropping their morale.",
            "An old injury flares up on {name}, causing them pain.",
            "{name} drinks unclean water and feels sick.",
            "{name} is caught in a sudden hailstorm, suffering minor injuries and losing 1 agility from the cold.",
            "{name}'s backpack strap breaks, and they lose a random item.",
            "{name} suffers a crisis of confidence, their will to fight falters, losing 1 charisma and morale.",
            "{name} eats what they thought was safe food, but gets a mild case of food poisoning.",
            "{name} is stalked by an unseen predator, heightening their paranoia.",
            "A sudden, unnerving silence falls over the arena, setting {name} on edge.",
            "{name} loses their footing and takes a hard fall, bruising their ribs and suffering a major injury.",
            "{name} misjudges a jump and lands awkwardly, taking damage.",
        ],
        allianceForm: [
            "After a tense standoff, {name1} and {name2} form a fragile alliance.",
            "Recognizing a common enemy, {name1} and {name2} agree to work together.",
            "{name1} uses their charm to convince {name2} to form an alliance.",
            "{name1} and {name2} share their supplies and decide to team up.",
            "Seeing strength in numbers, {name1} and {name2} join forces.",
            "{name1} saves {name2} from a dangerous situation, and they form an alliance out of gratitude.",
            "Realizing they can't survive alone, {name1} and {name2} reluctantly agree to an alliance.",
        ],
        allianceBetrayal: [
            "In the dead of night, {attacker} ambushes and kills their unsuspecting ally, {victim}.",
            "A heated argument over supplies ends with {attacker} killing {victim}.",
            "Sensing weakness, {attacker} turns on {victim}, breaking their alliance.",
            "{attacker} manipulates the alliance against {victim}, leading to their death.",
            "{attacker} poisons {victim}'s food, ending their alliance permanently.",
            "Seeing an opportunity, {attacker} ruthlessly eliminates their ally, {victim}, to improve their own odds.",
            "Claiming {victim} was a liability, {attacker} rallies the other allies to execute them.",
            "During a fight, {attacker} 'accidentally' strikes {victim}, dealing a fatal blow.",
        ],
        allianceActions: {
            positive: [
                "{alliance} works together to build a fortified shelter.",
                "{name1} teaches {name2} a survival skill, strengthening their bond within {alliance}.",
                "{alliance} successfully hunts down a large animal, providing plenty of food for everyone.",
                "{name1} stands guard while the rest of {alliance} sleeps safely.",
                "{name1} and {name2} successfully defend their camp from a lone predator, strengthening trust in {alliance}.",
                "{alliance} huddles together for warmth during a cold night, solidifying their bond.",
                "{alliance} finds a hidden cache of supplies left by a previous tribute.",
                "{name1} and {name2} manage to create a diversion, luring other tributes away from their camp.",
                "{alliance} works together to set up a series of clever traps around their camp.",
                "Members of {alliance} share stories of home, boosting morale and recovering a small amount of health.",
                "{alliance} manages to purify a large amount of water, securing their supply for days.",
                "{alliance} works in perfect sync to ambush and drive off a potential threat.",
                "A sponsor, impressed by their teamwork, sends {alliance} a large supply crate containing {item} and {item2}.",
            ],
            neutral: [
                "{name1} and {name2} spend the night sharing stories about their home districts.",
                "{alliance} spends the day scouting the surrounding area together.",
                "{alliance} debates their next move.",
                "{name1} and {name2} tend to their weapons, preparing for the next fight.",
                "{alliance} quietly observes another tribute from a safe distance.",
                "{alliance} moves their camp to a more defensible position.",
                "{alliance} takes inventory of their dwindling supplies.",
                "The members of {alliance} practice their combat skills with each other.",
            ],
            negative: [
                "{name1} and {name2} get into a heated argument, creating tension within {alliance}.",
                "{name1} suspects {name2} of hoarding supplies, causing distrust to fester within {alliance}.",
                "A disagreement on strategy leads to a shouting match, weakening the morale of {alliance}.",
                "{alliance} gets hopelessly lost after {name1} insists on following a shortcut.",
                "After a failed hunt, {alliance} begins to starve, and tempers flare.",
                "A member's carelessness attracts unwanted attention to the camp of {alliance}.",
                "The food supply of {alliance} is contaminated, making several members sick.",
                "Distrust begins to spread through {alliance} after a close call.",
                "{name1} accidentally injures {name2} while on watch.",
                "A valuable item goes missing from the supplies of {alliance}, and accusations fly between {name1} and {name2}.",
                "{name1} makes a reckless decision that endangers {alliance}, barely escaping.",
                "The shelter of {alliance} is discovered by other tributes, forcing them to relocate in a panic.",
                "A member's loud snoring keeps {alliance} awake, leaving them exhausted.",
                "{alliance} splits up after a bitter argument, with {name1} leaving.",
            ]
        },
        crafting: [
            "Using their intelligence, {name} crafts a {item} from scavenged materials.",
            "{name} spends hours working and finally manages to build a {item}.",
            "{name} creates a crude but effective {item}.",
            "{name} cleverly fashions a {item}, proud of their work.",
        ],
        arena: [ // These are generic arena events that can happen in any arena if a specific one isn't triggered
            "A sudden thunderstorm forces all tributes to seek shelter.",
            "The Gamemakers announce that a feast will be held at the Cornucopia.",
            "The eerie sound of a cannon firing echoes through the arena, but no portrait appears in the sky.",
            "A mysterious fog rolls in, causing disorientation and coughing fits.",
            "The borders of the arena shrink, forcing the tributes closer together.",
            "A supply drone flies overhead, but it is shot down before it can reach its target.",
            "The Gamemakers project images of the tributes' families in the sky, a cruel psychological trick.",
        ],
        multiTribute: [
            "{name1} and {name2} hunt down and attack {name3}, who barely manages to escape.",
            "{name1} attacks {name2}, but {name3} intervenes, saving {name2}.",
            "{name1}, {name2}, and {name3} stumble upon a hidden cache of supplies and argue over how to divide them.",
            "A fight breaks out between {name1} and {name2}. {name3} watches from a distance, waiting for an opportunity.",
            "{name1} sets a trap that injures both {name2} and {name3}.",
            "{name1} attempts to ambush {name2}, but {name3} spots them and warns {name2}.",
            "{name1}, {name2}, and {name3} form a temporary truce to hunt a dangerous mutt.",
            "{name1} offers to share their food with a starving {name2}, but {name3} objects, leading to a tense standoff.",
            "A wild animal attacks {name1}. {name2} helps fight it off, while {name3} runs away in fear.",
            "{name1} tries to mediate a fight between {name2} and {name3}, but only makes it worse.",
            "{name1} and {name2} work together to steal supplies from {name3}'s camp.",
            "A tense three-way standoff between {name1}, {name2}, and {name3} ends with everyone backing away slowly."
        ]
    },
    "Temperate Forest": {
        positive: ["{name} finds a patch of edible mushrooms, restoring some food.", "{name} successfully hunts a rabbit, providing a good meal.", "{name} finds a sponsor drone containing a {item} tangled in the trees.", "{name} finds a sturdy branch and some vines, perfect for crafting.", "{name} finds a clear stream to drink from."],
        negative: ["{name} is chased by a pack of wild dogs, receiving major injuries.", "{name} gets lost in the dense woods.", "{name} disturbs a nest of tracker jackers, gettinhg stung multiple times and suffering a critical injury.", "{name} is caught in a hunter's snare but escapes with moderate injuries."],
        arena: ["A forest fire spreads rapidly! Tributes must flee the inferno.", "Acidic rain begins to fall, forcing tributes to find cover or risk chemical burns.", "The trees begin to whisper the names of the fallen, a psychological attack by the Gamemakers that tests the tributes' sanity."]
    },
    "Scorching Desert": {
        positive: ["{name} discovers an oasis, fully replenishing their water.", "{name} finds shelter in a cave during the hottest part of the day.", "{name} finds a Gila monster and cooks it for a meal.", "{name} digs for water and finds a small, muddy puddle."],
        negative: ["{name} suffers from severe sunstroke, a life-threatening condition.", "{name}'s water container is punctured and leaks, losing most of their water.", "{name} is caught in a flash flood in a narrow canyon, sustaining moderate injuries.", "{name} is bitten by a venomous lizard, suffering a critical injury."],
        arena: ["A massive sandstorm engulfs the arena, reducing visibility to zero and making it hard to breathe.", "The Gamemakers use heat rays to dry up a known water source, a devastating blow to morale.", "The temperature drops to freezing during the night, a new and unexpected danger.", "Mirages appear, leading desperate tributes on fruitless journeys for water."]
    },
    "Tropical Jungle": {
        positive: ["{name} finds a bounty of tropical fruit.", "{name} fashions a weapon from bamboo.", "{name} discovers a pool with a tranquil waterfall.", "{name} identifies a plant with medicinal properties."],
        negative: ["{name} is attacked by a venomous snake and suffers a critical injury.", "{name} contracts a tropical disease from an insect bite, becoming severely weakened.", "{name} is stalked by a jaguar, narrowly escaping with moderate injuries.", "{name} falls into a pit of carnivorous plants, escaping with severe burns.", "{name} gets entangled in thick vines and struggles to get free, losing energy."],
        arena: ["A tsunami floods the low-lying areas of the jungle, forcing tributes to higher ground.", "Genetically engineered predators with unnatural speed and cunning are released into the arena.", "A volcano begins to erupt, spewing ash and lava, changing the landscape.", "Hallucinogenic spores are released from giant flowers, causing vivid and terrifying visions."]
    },
    "Frozen Tundra": {
        positive: ["{name} finds an abandoned igloo.", "{name} manages to catch a fish through a hole in the ice.", "{name} finds a thermal vent, providing warmth for a short time.", "{name} carves a shelter out of a snowdrift."],
        negative: ["{name} suffers from severe frostbite, a major injury.", "{name} falls through thin ice into freezing water, suffering a major shock.", "{name} suffers from snow blindness, making it hard to see.", "{name} is hunted by a polar bear mutt, barely escaping."],
        arena: ["A blizzard rages, reducing visibility to zero and making travel impossible.", "The temperature plummets to deadly lows during the night, threatening to kill anyone not sheltered.", "A pack of vicious wolf mutts with icy claws is unleashed.", "The ice begins to crack and shift, changing the landscape and creating dangerous crevasses."]
    },
    "Decaying Urban Ruins": {
        positive: ["{name} finds a cache of canned goods in a derelict supermarket.", "{name} finds a working faucet, refilling their water.", "{name} finds some useful metal scraps for crafting.", "{name} sets up a defensible position in an abandoned building.", "{name} finds a discarded map of the city's subway system."],
        negative: ["{name} falls through a collapsing floor, suffering a major injury.", "{name} is cornered by a pack of mutated rats, sustaining moderate injuries.", "{name} cuts themselves on rusted metal, the wound looks infected.", "{name} triggers an old landmine, the explosion deafens them and causes a severe injury.", "{name} is temporarily blinded by a reflection off a piece of glass."],
        arena: ["The Gamemakers trigger controlled demolitions of several buildings, forcing tributes out of their hiding spots.", "A toxic gas is released in the sewer systems, making them uninhabitable.", "Automated defense turrets are activated in the city center, firing on any tribute in sight.", "Holographic ghosts of fallen tributes appear, taunting the living with their final moments."]
    },
    "Mountain Range": {
        positive: ["{name} finds a secure cave to use as a base.", "{name} gains a vantage point to scout the area.", "{name} finds a mountain goat, a valuable source of food.", "{name} finds a patch of hardy herbs."],
        negative: ["{name} is caught in a rockslide, suffering a critical injury.", "{name} suffers from altitude sickness, becoming weakened and disoriented.", "{name} is attacked by a large eagle defending its nest, receiving moderate injuries.", "{name} slips on a loose rock, taking a nasty fall and sustaining a major injury."],
        arena: ["An avalanche sweeps down a mountainside, burying everything in its path.", "The Gamemakers unleash a pack of wolf-like muttations adapted for climbing.", "A lightning storm targets the highest peaks, making them extremely dangerous.", "The air thins, making it difficult to breathe and causing exhaustion."]
    },
    "Swampy Marshlands": {
        positive: ["{name} uses mud to camouflage themselves effectively.", "{name} catches several large frogs to eat.", "{name} builds a small raft to navigate the waterways.", "{name} finds a patch of dry land to make camp."],
        negative: ["{name} is attacked by a large alligator and is critically injured.", "{name} is tormented by swarms of biting insects, sustaining minor injuries but becoming exhausted.", "{name} wades into a patch of quicksand, barely escaping.", "{name} drinks contaminated water and becomes violently ill."],
        arena: ["A thick, disorienting fog rolls over the swamp, hiding tributes and threats alike.", "The water levels rise dramatically, submerging dry land and forcing tributes into the water.", "Flesh-eating bacteria contaminates a large portion of the water, a silent but deadly threat.", "Giant leeches are released into the waterways, latching onto unsuspecting tributes."]
    },
};

export const TRAPS = [
    {
        name: "Concealed Pitfall",
        detectionDC: 16,
        evasionDC: 14,
        damage: 25,
        effect: { stat: 'speed', change: -1 },
        description: "{name} falls into a concealed pit, taking a nasty fall.",
        successDescription: "{name} spots a cleverly disguised pitfall just in time.",
        evadeDescription: "{name} triggers a pitfall trap but manages to scramble out, suffering only minor scrapes.",
    },
    {
        name: "Snare Trap",
        detectionDC: 15,
        evasionDC: 16,
        damage: 10,
        effect: { stat: 'agility', change: -2 },
        description: "{name} steps into a snare trap, which jerks them into the air.",
        successDescription: "{name} notices a tripwire on the ground and carefully steps over it.",
        evadeDescription: "{name} feels the rope tighten around their ankle but cuts themselves free before being hoisted up.",
    },
    {
        name: "Poison Dart Trap",
        detectionDC: 18,
        evasionDC: 18,
        damage: 40,
        effect: null,
        description: "{name} feels a sharp prick in their neck and pulls out a small, poisoned dart.",
        successDescription: "{name} spots tiny holes in a tree trunk and wisely gives it a wide berth.",
        evadeDescription: "{name} hears a faint 'thwip' and dodges just as a poison dart whizzes past their head.",
    },
    {
        name: "Net Trap",
        detectionDC: 14,
        evasionDC: 15,
        damage: 5,
        effect: { stat: 'speed', change: -3 }, // Represents being tangled and exhausted
        description: "{name} is suddenly entangled in a heavy net that falls from the trees.",
        successDescription: "{name} sees a suspicious pile of leaves covering a rope and avoids it.",
        evadeDescription: "{name} is partially caught by a falling net but manages to tear their way out.",
    },
    {
        name: "Rockfall",
        detectionDC: 13, // easier to spot, harder to dodge
        evasionDC: 17,
        damage: 35,
        effect: null,
        description: "The ground trembles and {name} is caught in a sudden rockfall!",
        successDescription: "{name} hears a rumble from above and quickly moves to safety, avoiding a rockfall.",
        evadeDescription: "{name} is clipped by a falling rock but manages to dive behind cover, avoiding the worst of the rockslide.",
    }
];

export const DEATHS = {
    unarmed: [
        "was brutally overpowered by {attacker}, who ended their life with their bare hands",
        "was beaten to death by {attacker} in a savage confrontation",
        "was strangled by {attacker} after a brief and brutal struggle",
        "could not escape the relentless assault from {attacker} and succumbed to their injuries",
        "had their head smashed against a rock by {attacker}",
        "died from internal injuries after a brutal beating from {attacker}",
        "was cornered and killed by {attacker} without a weapon in sight",
    ],
    weapon: [
        "was killed by {attacker} with a {weapon}",
        "was mercilessly cut down by {attacker}'s {weapon}",
        "bled out from a wound inflicted by {attacker}'s {weapon}",
        "was outmatched by {attacker}, who ended the fight with a {weapon}",
        "was ambushed and killed by {attacker} with a {weapon}",
        "received a fatal blow from {attacker}'s {weapon}",
        "could not defend against {attacker}'s skilled use of a {weapon}",
        "stumbled into {attacker}'s path and was eliminated with a {weapon}",
    ],
    betrayal: [
        "was betrayed and killed by their former ally, {attacker}",
        "was stabbed in the back by {attacker}",
        "let their guard down around {attacker}, which proved to be a fatal mistake",
        "died from a poisoned meal given to them by their supposed ally, {attacker}",
    ],
    environment: {
        universal: [ "Succumbed to their injuries after a fall.", "Died from an untreated infection.", "Died in a tragic accident.", "Succumbed to starvation.", "Succumbed to dehydration.", "Wandered off a cliff in the dark.", "Died from an allergic reaction to an insect sting.", "Killed by a sudden rockslide.", "Tripped and fell on their own weapon.", "Killed by a freak lightning strike.", "Accidentally triggered a hidden Gamemaker trap.", "A small cut became infected, leading to a fatal case of sepsis." ],
        "Temperate Forest": ["Was eaten by a bear.", "Succumbed to tracker jacker venom after being stung multiple times.", "Died from a fall from a tall tree.", "Ate poisonous nightlock berries by mistake.", "Was mauled by a bear while searching for food."],
        "Scorching Desert": ["Succumbed to dehydration under the relentless sun.", "Died from a scorpion sting.", "Died of heatstroke.", "Was buried in a flash flood.", "Was bitten by a venomous snake while seeking shade."],
        "Tropical Jungle": ["Killed by genetically engineered predators.", "Succumbed to a fast-acting poison from a plant.", "Killed by a jaguar.", "Was constricted by a giant snake.", "Touched a poison dart frog and died instantly."],
        "Frozen Tundra": ["Froze to death during the night.", "Fell into a crevasse.", "Killed by wolf mutts.", "Fell through thin ice into the freezing water.", "Died after getting lost in a whiteout blizzard."],
        "Decaying Urban Ruins": ["Killed by a collapsing structure.", "Cornered and killed by mutts in the subway tunnels.", "Died from a severe infection from rusted metal.", "Was killed by an automated defense system.", "Breathed in toxic gas from a sealed-off area."],
        "Mountain Range": ["Fell from a high cliff.", "Died in an avalanche.", "Killed by territorial mutts.", "Died from a lack of oxygen at high altitude.", "Lost their footing and fell into a deep chasm."],
        "Swampy Marshlands": ["Dragged underwater by an unknown creature.", "Succumbed to a flesh-eating bacteria.", "Killed by an alligator.", "Was poisoned by a venomous frog.", "Was pulled into a sinkhole."],
    }
};