import React from 'react';
import type { Tribute } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { ResetIcon } from './icons/ResetIcon';
import { ScrollIcon } from './icons/ScrollIcon';
import { StrengthIcon } from './icons/StrengthIcon';
import { AgilityIcon } from './icons/AgilityIcon';
import { SpeedIcon } from './icons/SpeedIcon';
import { IntelligenceIcon } from './icons/IntelligenceIcon';
import { CharismaIcon } from './icons/CharismaIcon';
import { SkillIcon } from './icons/SkillIcon';
import { TraitIcon } from './icons/TraitIcon';
import { RefreshIcon } from './icons/RefreshIcon';


interface ReapingPageProps {
  tributes: Tribute[];
  onBegin: () => void;
  onBack: () => void;
  onRegenerate: () => void;
  tributeSet: 'book' | 'generic';
}

const statDescriptions = {
    strength: "Strength: Affects melee combat effectiveness and physical tasks like climbing or carrying.",
    agility: "Agility: Influences dodging, climbing, and success in complex physical actions. Key for defense.",
    speed: "Speed: Determines the ability to flee from combat, chase opponents, and travel quickly through the arena.",
    intelligence: "Intelligence: Governs crafting ability, trap detection/creation, and strategic decision-making.",
    charisma: "Charisma: Increases the chances of successfully forming alliances and receiving gifts from sponsors."
};

const StatDisplay: React.FC<{ icon: React.ReactNode; value: number, label: keyof typeof statDescriptions }> = ({ icon, value, label }) => (
    <div className="flex flex-col items-center" title={statDescriptions[label]}>
        {icon}
        <span className="text-sm font-bold">{value}</span>
    </div>
);

const TributeCard: React.FC<{ tribute: Tribute }> = ({ tribute }) => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-amber-500 transition-all duration-300 flex flex-col h-full">
        <div className="flex-grow">
            <p className="font-bold text-lg text-slate-100">{tribute.name}</p>
            <p className="text-sm text-amber-400 mb-3">District {tribute.district}</p>

            <div className="grid grid-cols-5 gap-2 text-slate-300 my-3 py-2 border-y border-slate-700">
                <StatDisplay icon={<StrengthIcon className="h-5 w-5 mb-1" />} value={tribute.strength} label="strength" />
                <StatDisplay icon={<AgilityIcon className="h-5 w-5 mb-1" />} value={tribute.agility} label="agility" />
                <StatDisplay icon={<SpeedIcon className="h-5 w-5 mb-1" />} value={tribute.speed} label="speed" />
                <StatDisplay icon={<IntelligenceIcon className="h-5 w-5 mb-1" />} value={tribute.intelligence} label="intelligence" />
                <StatDisplay icon={<CharismaIcon className="h-5 w-5 mb-1" />} value={tribute.charisma} label="charisma" />
            </div>

            <div>
                <h4 className="font-semibold text-slate-300 text-sm mb-1">Skills</h4>
                {tribute.skills.length > 0 ? (
                    <ul className="text-xs text-slate-400 space-y-1">
                        {tribute.skills.map((skill) => (
                            <li key={skill.name} className="flex items-start gap-2">
                                <SkillIcon className="h-3 w-3 mt-0.5 text-amber-400 flex-shrink-0" />
                                <span><span className="font-semibold text-slate-300">{skill.name}:</span> {skill.description}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-xs text-slate-500 italic">No special skills.</p>}
            </div>

            {tribute.traits.length > 0 && (
                <div className="mt-3">
                    <h4 className="font-semibold text-red-400 text-sm mb-1">Negative Traits</h4>
                     <ul className="text-xs text-slate-400 space-y-1">
                        {tribute.traits.map((trait) => (
                            <li key={trait.name} className="flex items-start gap-2">
                                <TraitIcon className="h-3 w-3 mt-0.5 text-red-400 flex-shrink-0" />
                                <span><span className="font-bold text-red-300">{trait.name}:</span> {trait.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);


const ReapingPage: React.FC<ReapingPageProps> = ({ tributes, onBegin, onBack, onRegenerate, tributeSet }) => {
    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                     <div className="flex items-center justify-center gap-4">
                        <ScrollIcon className="h-12 w-12 text-amber-400" />
                        <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-wider" style={{fontFamily: `'Cinzel', serif`}}>
                            The Reaping
                        </h1>
                    </div>
                    <p className="text-slate-400 mt-2">Behold this year's tributes.</p>
                </header>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {tributes.map(tribute => (
                        <TributeCard key={tribute.id} tribute={tribute} />
                    ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <button
                        onClick={onBegin}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                        >
                        <PlayIcon className="h-5 w-5" />
                        Begin the Games!
                    </button>
                    {tributeSet === 'generic' && (
                        <button
                            onClick={onRegenerate}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-all duration-200"
                        >
                            <RefreshIcon className="h-5 w-5" />
                            Regenerate Tributes
                        </button>
                    )}
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-600 text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-all duration-200"
                        >
                        <ResetIcon className="h-5 w-5" />
                        Change Settings
                    </button>
                </div>
            </div>
            <style>{`
              @keyframes fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              .animate-fade-in {
                animation: fade-in 0.7s ease-out forwards;
              }
            `}</style>
        </div>
    );
};

export default ReapingPage;