import React, { useMemo } from 'react';
import type { GameSummary } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsIcon } from './icons/StatsIcon';

interface GameStatisticsProps {
  summary: GameSummary;
}

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#82ca9d', '#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a3e635'];

const simplifyCause = (cause: string): string => {
    const lowerCause = cause.toLowerCase();
    if (lowerCause.includes('killed by') || lowerCause.includes('beaten to death')) return 'Combat';
    if (lowerCause.includes('betrayed')) return 'Betrayal';
    if (lowerCause.includes('starvation') || lowerCause.includes('thirst') || lowerCause.includes('dehydration')) return 'Exposure';
    if (lowerCause.includes('injuries')) return 'Injuries';
    if (lowerCause.includes('succumbed to') || lowerCause.includes('died from')) return 'Environment';
    if (lowerCause.includes('eaten by') || lowerCause.includes('muttation')) return 'Muttation/Wildlife';
    return 'Other';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
        <p className="label font-bold text-amber-400">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
             <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't render label for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const ChartContainer: React.FC<{ title: string, hasData: boolean, children: React.ReactElement }> = ({ title, hasData, children }) => (
    <div>
        <h4 className="font-semibold text-slate-300 mb-2 text-center">{title}</h4>
        {hasData ? (
            <ResponsiveContainer width="100%" height={200}>
                {children}
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[200px] bg-slate-700/30 rounded-md">
                <p className="text-slate-500 italic">Not enough data to display.</p>
            </div>
        )}
    </div>
);


const GameStatistics: React.FC<GameStatisticsProps> = ({ summary }) => {
    const { placements, timeline } = summary;

    const survivalData = useMemo(() => {
        const totalTributes = placements.length;
        if (totalTributes === 0) return [];
        const maxDay = Math.max(0, ...placements.map(p => p.daysSurvived));
        const data = [{ day: 'Start', Tributes: totalTributes }];
        
        let aliveCount = totalTributes;
        const deathsByDay: Record<number, number> = {};
        timeline.forEach(death => {
            deathsByDay[death.day] = (deathsByDay[death.day] || 0) + 1;
        });

        for (let i = 0; i <= maxDay; i++) {
            aliveCount -= (deathsByDay[i] || 0);
            data.push({ day: i === 0 ? 'Bloodbath' : `Day ${i}`, Tributes: Math.max(0, aliveCount) });
        }
        return data;
    }, [placements, timeline]);

    const causeOfDeathData = useMemo(() => {
        const causeCounts: Record<string, number> = {};
        timeline.forEach(entry => {
            const simplified = simplifyCause(entry.cause);
            causeCounts[simplified] = (causeCounts[simplified] || 0) + 1;
        });
        return Object.entries(causeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [timeline]);

    const topKillersData = useMemo(() => {
        return placements
            .filter(t => t.kills > 0)
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 5)
            .map(t => ({ name: t.name, Kills: t.kills }));
    }, [placements]);

    const districtStats = useMemo(() => {
        const stats: Record<string, { totalKills: number, totalDays: number, count: number }> = {};
        placements.forEach(t => {
            const districtKey = `D${t.district}`;
            if (!stats[districtKey]) {
                stats[districtKey] = { totalKills: 0, totalDays: 0, count: 0 };
            }
            stats[districtKey].totalKills += t.kills;
            stats[districtKey].totalDays += t.daysSurvived;
            stats[districtKey].count += 1;
        });

        const killsData = Object.entries(stats).map(([district, data]) => ({
            name: district,
            Kills: data.totalKills
        })).sort((a,b) => b.Kills - a.Kills);

        const survivalData = Object.entries(stats).map(([district, data]) => ({
            name: district,
            'Avg Days': parseFloat((data.totalDays / data.count).toFixed(2))
        })).sort((a,b) => b['Avg Days'] - a['Avg Days']);

        return { killsData, survivalData };
    }, [placements]);


    return (
        <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3"><StatsIcon />Game Statistics</h3>

            <div className="space-y-8">
                {/* Survival Rate */}
                <ChartContainer title="Tribute Survival Over Time" hasData={survivalData.length > 1}>
                    <LineChart data={survivalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" allowDecimals={false} domain={[0, 'dataMax']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="Tributes" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ChartContainer>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Cause of Death */}
                    <ChartContainer title="Causes of Death" hasData={causeOfDeathData.length > 0}>
                        <PieChart>
                            <Pie data={causeOfDeathData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomizedLabel}>
                                {causeOfDeathData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                        </PieChart>
                    </ChartContainer>

                    {/* Top Killers */}
                    <ChartContainer title="Top Killers" hasData={topKillersData.length > 0}>
                        <BarChart data={topKillersData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} tick={{fontSize: 12}} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Kills" fill="#dc2626" />
                        </BarChart>
                    </ChartContainer>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                    {/* Kills by District */}
                    <ChartContainer title="Kills by District" hasData={districtStats.killsData.some(d => d.Kills > 0)}>
                        <BarChart data={districtStats.killsData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Kills" fill="#be123c" />
                        </BarChart>
                    </ChartContainer>
                     {/* Average Survival by District */}
                     <ChartContainer title="Average Survival by District" hasData={districtStats.survivalData.length > 0}>
                        <BarChart data={districtStats.survivalData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Avg Days" fill="#0369a1" />
                        </BarChart>
                    </ChartContainer>
                </div>

            </div>
        </div>
    );
};

export default GameStatistics;