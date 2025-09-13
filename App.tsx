
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GameSettings, Tribute, GameDay, GameSummary, Arena, TributeStat } from './types';
import { GameState } from './types';
import { TRIBUTE_SETS, ARENAS } from './constants';
import { generateDayReport, triggerFinale, triggerSuddenDeath, initializeRelationships, generateTrainingDayReport, cullTributesForFinale } from './services/simulationService';
import ConfigPanel from './components/ConfigPanel';
import TributeStatus from './components/TributeStatus';
import EventLog from './components/EventLog';
import GameSummaryComponent from './components/GameSummary';
import AllianceStatus from './components/AllianceStatus';
import ReapingPage from './components/ReapingPage';
import { LogoIcon } from './components/icons/LogoIcon';

const applyArenaEffects = (tributes: Tribute[], arena: Arena): Tribute[] => {
    return tributes.map(tribute => {
        const newTribute = { ...tribute };
        const applicableEffect = arena.effects.find(e => e.districts.includes(newTribute.district));
        if (applicableEffect) {
            if (applicableEffect.buffs) {
                for (const stat in applicableEffect.buffs) {
                    const key = stat as TributeStat;
                    if(newTribute[key]) {
                        newTribute[key] = Math.min(10, newTribute[key] + (applicableEffect.buffs[key] || 0));
                    }
                }
            }
            if (applicableEffect.nerfs) {
                for (const stat in applicableEffect.nerfs) {
                     const key = stat as TributeStat;
                     if(newTribute[key]) {
                        newTribute[key] = Math.max(1, newTribute[key] - (applicableEffect.nerfs[key] || 0));
                     }
                }
            }
        }
        return newTribute;
    });
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<GameSettings>({
    arenaType: ARENAS[0].name,
    eventSpeed: 500,
    tributeSet: 'book',
    maxDays: 10,
    bloodbathDeaths: 4,
    pacing: 'stream',
  });
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [gameLog, setGameLog] = useState<GameDay[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulatingInstant, setIsSimulatingInstant] = useState(false);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);
  const [showImportantEventsOnly, setShowImportantEventsOnly] = useState(false);

  const eventLogRef = useRef<HTMLDivElement>(null);
  const simulationState = useRef<{ tributes: Tribute[], day: number, log: GameDay[] }>({ tributes: [], day: 0, log: [] }).current;

  const initializeTributes = useCallback(() => {
    const tributeData = settings.tributeSet === 'book' ? TRIBUTE_SETS.book : TRIBUTE_SETS.generic();
    let initialTributes = tributeData.map((t, index) => ({
      ...t,
      id: index + 1,
      status: 'alive' as const,
      health: 100,
      maxHealth: 100,
      food: 50,
      water: 50,
      inventory: [],
      allies: [],
      kills: 0,
      daysSurvived: 0,
      traits: t.traits || [],
      relationships: {},
      morale: 0,
    }));
    return initializeRelationships(initialTributes);
  }, [settings.tributeSet]);
  
  const handleRegenerateTributes = useCallback(() => {
    if (settings.tributeSet !== 'generic') return;

    let tributesToReap = initializeTributes();
    tributesToReap = applyArenaEffects(tributesToReap, selectedArena);
    setTributes(tributesToReap);
  }, [initializeTributes, selectedArena, settings.tributeSet]);

  const resetGame = useCallback(() => {
    setGameState(GameState.Idle);
    setTributes([]);
    setGameLog([]);
    setCurrentDay(0);
    setGameSummary(null);
    setError(null);
    setIsSimulatingInstant(false);
    simulationState.tributes = [];
    simulationState.day = 0;
    simulationState.log = [];
  }, [simulationState]);
  
  useEffect(() => {
    // This effect now only resets the game if the tribute set is changed while idle.
    if(gameState === GameState.Idle) {
       setTributes(initializeTributes());
    }
  }, [settings.tributeSet, gameState, initializeTributes]);

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [gameLog]);

  const finalizeGame = (finalTributes: Tribute[], finalLog: GameDay[]) => {
      const aliveTributes = finalTributes.filter(t => t.status === 'alive');
      const winner = aliveTributes.length === 1 ? aliveTributes[0] : null;

      const remainingSurvivors = aliveTributes.sort((a, b) => b.kills - a.kills);

      const timeline = finalLog.flatMap(day => 
          day.deaths.map(death => ({
              day: day.day,
              tributeName: death.tributeName,
              tributeId: death.tributeId,
              cause: death.cause,
          }))
      );

      // Get fallen tributes in the order they died
      const fallenTributesInOrder = timeline.map(deathEvent => {
          return finalTributes.find(t => t.id === deathEvent.tributeId);
      }).filter((t): t is Tribute => t !== undefined);
      
      // Reverse the order for placements (last to die is highest placed)
      const placements = winner 
          ? [winner, ...[...fallenTributesInOrder].reverse()] 
          : [...remainingSurvivors, ...[...fallenTributesInOrder].reverse()];

      setGameSummary({ winner, placements, timeline, log: finalLog });
      setGameState(GameState.Finished);
  };
  
  const runFullSimulation = (initialTributes: Tribute[], initialLog: GameDay[], arena: Arena) => {
      let currentTributes = initialTributes;
      let tempLog = initialLog;
      let day = 0;
      
      while(true) {
        let aliveTributes = currentTributes.filter(t => t.status === 'alive');
        
        if (aliveTributes.length === 2) {
            const { updatedTributes, dayReport } = triggerFinale(currentTributes, arena);
            const finaleDay: GameDay = { day: day + 1, ...dayReport };
            tempLog.push(finaleDay);
            finalizeGame(updatedTributes, tempLog);
            break;
        }

        if (aliveTributes.length <= 1) {
            finalizeGame(currentTributes, tempLog);
            break;
        }

        day++;

        if (day > settings.maxDays) {
            const { updatedTributes, dayReport } = triggerSuddenDeath(currentTributes, arena);
            const suddenDeathDay: GameDay = { day, ...dayReport };
            tempLog.push(suddenDeathDay);
            finalizeGame(updatedTributes, tempLog);
            break;
        }
        
        if (day === settings.maxDays && aliveTributes.length > 4) {
            const { updatedTributes: culledTributes, dayReport: cullingReport } = cullTributesForFinale(aliveTributes, 4, arena, currentTributes);
            currentTributes = culledTributes;
            tempLog.push({ day: day - 0.5, ...cullingReport });
        }
        
        const { updatedTributes, dayReport } = generateDayReport(currentTributes, day, arena, { bloodbathDeaths: settings.bloodbathDeaths });
        currentTributes = updatedTributes;
        tempLog.push({ day, ...dayReport });
      }
  };

  const runSimulationStep = useCallback(async () => {
    let { tributes: currentTributes, day, log: tempLog } = simulationState;

    let aliveTributes = currentTributes.filter(t => t.status === 'alive');
    
    if (aliveTributes.length === 2) {
        const { updatedTributes, dayReport } = triggerFinale(currentTributes, selectedArena);
        const finaleDay: GameDay = { day: day + 1, ...dayReport };
        tempLog.push(finaleDay);
        setGameLog([...tempLog]);
        finalizeGame(updatedTributes, tempLog);
        return;
    }

    if (aliveTributes.length <= 1) {
      finalizeGame(currentTributes, tempLog);
      return;
    }
    
    day++;

    if (day > settings.maxDays) {
        const { updatedTributes, dayReport } = triggerSuddenDeath(currentTributes, selectedArena);
        const suddenDeathDay: GameDay = { day, ...dayReport };
        tempLog.push(suddenDeathDay);
        setGameLog([...tempLog]);
        finalizeGame(updatedTributes, tempLog);
        return;
    }
    
    if (day === settings.maxDays && aliveTributes.length > 4) {
        const { updatedTributes: culledTributes, dayReport: cullingReport } = cullTributesForFinale(aliveTributes, 4, selectedArena, currentTributes);
        currentTributes = culledTributes;
        tempLog.push({ day: day - 0.5, ...cullingReport });
    }

    simulationState.day = day;
    setCurrentDay(day);

    try {
      const { updatedTributes, dayReport } = generateDayReport(currentTributes, day, selectedArena, { bloodbathDeaths: settings.bloodbathDeaths });
      
      simulationState.tributes = updatedTributes;
      setTributes([...updatedTributes]);
      
      const newGameDay: GameDay = { day, ...dayReport };
      
      tempLog.push(newGameDay);
      simulationState.log = tempLog;
      setGameLog([...tempLog]);
      
      const stillAlive = updatedTributes.filter(t => t.status === 'alive');
       if (stillAlive.length === 2) {
          const { updatedTributes: finalTributes, dayReport: finaleReport } = triggerFinale(updatedTributes, selectedArena);
          const finaleDay: GameDay = { day: day + 0.5, ...finaleReport }; // Use fractional day for finale
          tempLog.push(finaleDay);
          simulationState.log = tempLog;
          setGameLog([...tempLog]);
          finalizeGame(finalTributes, tempLog);
          return;
      }
      if (stillAlive.length <= 1) {
          finalizeGame(updatedTributes, tempLog);
          return;
      }
      
      if (settings.pacing === 'stream') {
        setTimeout(runSimulationStep, settings.eventSpeed);
      } else {
        setGameState(GameState.Paused);
      }

    } catch (e) {
      console.error(e);
      setError("A critical simulation error occurred. The arena might be unstable.");
      setGameState(GameState.Finished);
    }
  }, [settings.pacing, settings.eventSpeed, settings.bloodbathDeaths, settings.maxDays, simulationState, selectedArena]);

  const handleGoToReaping = () => {
    setError(null);
    let tributesToReap = initializeTributes();

    let finalArena = ARENAS.find(a => a.name === settings.arenaType);
    if (!finalArena || settings.arenaType === 'Random') {
        finalArena = ARENAS[Math.floor(Math.random() * (ARENAS.length-1))+1]; // Avoid 'Random' itself
    }
    setSelectedArena(finalArena);

    tributesToReap = applyArenaEffects(tributesToReap, finalArena);

    setTributes(tributesToReap);
    setGameState(GameState.Reaping);
  };
  
  const handleBeginGames = () => {
    const { updatedTributes: tributesAfterTraining, dayReport: trainingReport } = generateTrainingDayReport(tributes);
    const trainingDay: GameDay = { day: 0, ...trainingReport };
    
    const initialLog = [trainingDay];

    if (settings.pacing === 'instant') {
        setIsSimulatingInstant(true);
        setTimeout(() => {
            runFullSimulation(tributesAfterTraining, initialLog, selectedArena);
            setIsSimulatingInstant(false);
        }, 100);
        return;
    }
    
    simulationState.tributes = tributesAfterTraining;
    simulationState.day = 0; // Day is 0 after training. runSimulationStep will increment to 1.
    simulationState.log = initialLog;

    setTributes([...tributesAfterTraining]);
    setGameLog(initialLog);
    setCurrentDay(0);
    setGameSummary(null);

    if (settings.pacing === 'stream') {
        setGameState(GameState.Running);
        setTimeout(runSimulationStep, settings.eventSpeed);
    } else {
        setGameState(GameState.Paused);
    }
  };
  
  const handleNextDay = () => {
    setGameState(GameState.Running);
    runSimulationStep();
  };
  
  if (isSimulatingInstant) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
             <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-xl">The Gamemakers are running the simulation...</p>
            <p className="text-sm">May the odds be ever in your favor.</p>
          </div>
      )
  }

  if (gameState === GameState.Finished && gameSummary) {
    return <GameSummaryComponent summary={gameSummary} onReset={resetGame} />;
  }
  
  if (gameState === GameState.Reaping) {
      return <ReapingPage 
        tributes={tributes} 
        onBegin={handleBeginGames} 
        onBack={resetGame}
        onRegenerate={handleRegenerateTributes}
        tributeSet={settings.tributeSet}
      />;
  }

  const isSimulating = gameState === GameState.Running || gameState === GameState.Paused;

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {!isSimulating && (
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-4">
              <LogoIcon className="h-12 w-12 text-amber-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 tracking-wider" style={{fontFamily: `'Cinzel', serif`}}>
                Hunger Games Simulator
              </h1>
            </div>
            <p className="text-slate-400 mt-2">May the odds be ever in your favor.</p>
          </header>
        )}

        <main className={`${isSimulating ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-full' : 'max-w-md mx-auto'}`}>
          {gameState === GameState.Idle ? (
            <ConfigPanel
                settings={settings}
                setSettings={setSettings}
                onStart={handleGoToReaping}
                onReset={resetGame}
                gameState={gameState}
            />
          ) : (
             <>
              <div className="lg:col-span-8">
                <EventLog
                  log={gameLog}
                  isLoading={gameState === GameState.Running}
                  currentDay={currentDay}
                  onNextDay={settings.pacing === 'day' && gameState === GameState.Paused ? handleNextDay : undefined}
                  ref={eventLogRef}
                  showImportantEventsOnly={showImportantEventsOnly}
                  setShowImportantEventsOnly={setShowImportantEventsOnly}
                />
              </div>
              <div className="lg:col-span-4">
                <div className="sticky top-8">
                    <TributeStatus tributes={tributes} />
                    <AllianceStatus tributes={tributes} />
                </div>
              </div>
            </>
          )}
        </main>
        
        {error && (
          <div className="fixed bottom-5 right-5 bg-red-800 text-white p-4 rounded-lg shadow-xl max-w-sm">
            <h3 className="font-bold">Simulation Error</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
