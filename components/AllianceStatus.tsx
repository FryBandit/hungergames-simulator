import React, { useMemo } from 'react';
import type { Tribute } from '../types';
import { UsersIcon } from './icons/UsersIcon';

interface AllianceStatusProps {
  tributes: Tribute[];
}

const getCohesionText = (score: number) => {
    if (score >= 80) return { text: "Maximum", color: "text-purple-400" };
    if (score >= 60) return { text: "Strong", color: "text-sky-400" };
    if (score >= 20) return { text: "Stable", color: "text-green-400" };
    if (score > -20) return { text: "Tense", color: "text-yellow-400" };
    return { text: "Fraying", color: "text-red-500" };
}

const AllianceStatus: React.FC<AllianceStatusProps> = ({ tributes }) => {
    const alliances = useMemo(() => {
        const aliveTributes = tributes.filter(t => t.status === 'alive');
        const processedIds = new Set<number>();
        const allianceGroups: Tribute[][] = [];

        for (const tribute of aliveTributes) {
            if (processedIds.has(tribute.id) || tribute.allies.length === 0) {
                continue;
            }

            const currentGroup: Tribute[] = [];
            const toProcess: number[] = [tribute.id];
            const groupIds = new Set<number>();

            while (toProcess.length > 0) {
                const currentId = toProcess.pop()!;
                if (groupIds.has(currentId)) continue;

                const currentTribute = tributes.find(t => t.id === currentId);
                if (!currentTribute || currentTribute.status !== 'alive') continue;

                groupIds.add(currentId);
                processedIds.add(currentId);
                currentGroup.push(currentTribute);

                for (const allyId of currentTribute.allies) {
                    if (!groupIds.has(allyId)) {
                        toProcess.push(allyId);
                    }
                }
            }

            if (currentGroup.length > 1) {
                allianceGroups.push(currentGroup);
            }
        }

        return allianceGroups.map(group => {
            const powerScore = group.reduce((sum, member) => sum + member.strength + member.agility + member.intelligence, 0);

            let totalRelationshipScore = 0;
            let relationshipPairs = 0;
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const memberA = group[i];
                    const memberB = group[j];
                    totalRelationshipScore += memberA.relationships[memberB.id]?.score ?? 0;
                    relationshipPairs++;
                }
            }
            const cohesion = relationshipPairs > 0 ? totalRelationshipScore / relationshipPairs : 0;

            return { members: group, powerScore, cohesion };
        });
    }, [tributes]);


    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mt-8">
            <h3 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-3">
                <UsersIcon className="h-6 w-6" />
                Active Alliances
            </h3>
            <div className="space-y-4">
                {alliances.length > 0 ? (
                    alliances.map((alliance, index) => {
                        const cohesion = getCohesionText(alliance.cohesion);
                        return (
                            <div key={index} className="bg-slate-700/50 p-3 rounded-md">
                                <div className="flex justify-between items-start mb-2">
                                     <p className="font-semibold text-slate-300">
                                        Alliance #{index + 1}
                                    </p>
                                    <div className="text-right text-xs">
                                        <p className="text-slate-400">Power Score: <span className="font-bold text-amber-400">{alliance.powerScore}</span></p>
                                        <p className="text-slate-400">Cohesion: <span className={`font-bold ${cohesion.color}`}>{cohesion.text}</span></p>
                                    </div>
                                </div>
                                <ul className="text-sm text-slate-400">
                                    {alliance.members.map(member => (
                                        <li key={member.id}>- {member.name} (D{member.district})</li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-slate-400 text-sm">No active alliances.</p>
                )}
            </div>
        </div>
    );
};

export default AllianceStatus;
