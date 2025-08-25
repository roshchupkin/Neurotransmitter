import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Brain, Zap, Heart, Lightbulb, Target, RotateCcw } from 'lucide-react';

// --- TYPES (Moved to top level for clarity) ---
interface Neurotransmitter {
  name: string;
  icon: string;
  color: string;
  function: string;
  description: string;
  effects: string[];
  disorders: string[];
  facts: string;
}

interface PowerUp {
  name: string;
  icon: string;
  color: string;
  effect: string;
  duration: number;
}

interface FallingNT extends Neurotransmitter {
  id: number;
  x: number;
  y: number;
}

interface ActivePowerUp extends PowerUp {
  id: number;
  x: number;
  y: number;
  active: boolean;
  endTime: number;
  type: string;
}

// --- SUB-COMPONENTS (Moved outside the main component) ---

const LearnMode = React.memo(({ neurotransmitters, currentLevel, setCurrentLevel }: {
  neurotransmitters: Neurotransmitter[];
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const nt = neurotransmitters[currentLevel];
  
  const handlePrevious = useCallback(() => {
    setCurrentLevel(prev => Math.max(0, prev - 1));
  }, [setCurrentLevel]);
  
  const handleNext = useCallback(() => {
    setCurrentLevel(prev => Math.min(neurotransmitters.length - 1, prev + 1));
  }, [setCurrentLevel, neurotransmitters.length]);
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className={`inline-block p-6 rounded-full ${nt.color} text-white mb-4`}>
          <span className="text-4xl">{nt.icon}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{nt.name}</h2>
        <p className="text-xl text-gray-600">{nt.function}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              What it does
            </h3>
            <p className="text-gray-700">{nt.description}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Effects
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {nt.effects.map((effect, idx) => (
                <li key={idx}>{effect}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Related Conditions
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {nt.disorders.map((disorder, idx) => (
                <li key={idx}>{disorder}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Fun Fact
            </h3>
            <p className="text-gray-700">{nt.facts}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentLevel === 0}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors"
        >
          Previous
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {currentLevel + 1} of {neurotransmitters.length}
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentLevel === neurotransmitters.length - 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
});

const QuizMode = React.memo(({ quizQuestions, currentLevel, setCurrentLevel, score, setScore }: {
    quizQuestions: { question: string; options: string[]; correct: number; explanation: string; }[];
    currentLevel: number;
    setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const question = quizQuestions[currentLevel % quizQuestions.length];
  
  const handleAnswer = useCallback((optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowResult(true);
    if (optionIndex === question.correct) {
      setScore(prev => prev + 1);
    }
  }, [question.correct, setScore]);

  const nextQuestion = useCallback(() => {
    setCurrentLevel(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [setCurrentLevel]);

  useEffect(() => {
    // Reset local state when quiz mode is restarted
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentLevel]);


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Mode</h2>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
          <span>Question {(currentLevel % quizQuestions.length) + 1}</span>
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !showResult && handleAnswer(idx)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                showResult
                  ? idx === question.correct
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : selectedAnswer === idx
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-gray-50 border-gray-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
              disabled={showResult}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium mb-2">
            {selectedAnswer === question.correct ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}

      <div className="text-center">
        {showResult ? (
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Next Question
          </button>
        ) : null}
      </div>
    </div>
  );
});

const ArcadeGame = React.memo(({ neurotransmitters, powerUpTypes }: {
  neurotransmitters: Neurotransmitter[];
  powerUpTypes: PowerUp[];
}) => {
    const [arcadeScore, setArcadeScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameActive, setGameActive] = useState(false);
    const [playerPos, setPlayerPos] = useState(50);
    const [fallingNTs, setFallingNTs] = useState<FallingNT[]>([]);
    const [currentTarget, setCurrentTarget] = useState<Neurotransmitter | null>(null);
    const [gameSpeed, setGameSpeed] = useState(1);
    const [level, setLevel] = useState(1);
    const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
    const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [speedBoost, setSpeedBoost] = useState(false);
    const [shieldActive, setShieldActive] = useState(false);

    const keysRef = useRef<Record<string, boolean>>({});
    const [highScore, setHighScore] = useState(0);
    const animationFrameRef = useRef<number>();
    const lastTimeRef = useRef(0);
    const spawnTimeRef = useRef(0);
    const targetTimeRef = useRef(0);
    
    const resetGameState = useCallback(() => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setGameActive(false);
        setArcadeScore(0);
        setLives(3);
        setLevel(1);
        setGameSpeed(1);
        setFallingNTs([]);
        setPowerUps([]);
        setActivePowerUps([]);
        setPlayerPos(50);
        setCurrentTarget(null);
        setCombo(0);
        setMaxCombo(0);
        setGameTime(0);
        setMultiplier(1);
        setSpeedBoost(false);
        setShieldActive(false);
        lastTimeRef.current = 0;
        spawnTimeRef.current = 0;
        targetTimeRef.current = 0;
        keysRef.current = {};
    }, []);

    const startGame = useCallback(() => {
        resetGameState();
        setGameActive(true);
        const randomNT = neurotransmitters[Math.floor(Math.random() * neurotransmitters.length)];
        setCurrentTarget(randomNT);
    }, [resetGameState, neurotransmitters]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
                e.preventDefault();
                const key = e.key.toLowerCase();
                keysRef.current[key] = true;
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
                e.preventDefault();
                const key = e.key.toLowerCase();
                keysRef.current[key] = false;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    
    // Main Game Loop
    useEffect(() => {
      if (!gameActive) {
        return;
      }
  
      let animationFrameId: number;
  
      const gameLoop = (timestamp: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
          animationFrameId = requestAnimationFrame(gameLoop);
          return;
        }
  
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        setGameTime(prev => prev + deltaTime);
  
        // Player Movement
        setPlayerPos(prev => {
          const moveSpeed = speedBoost ? 0.15 : 0.08; // Units per millisecond
          let newPos = prev;
          if (keysRef.current['arrowleft'] || keysRef.current['a']) newPos -= moveSpeed * deltaTime;
          if (keysRef.current['arrowright'] || keysRef.current['d']) newPos += moveSpeed * deltaTime;
          return Math.max(5, Math.min(95, newPos));
        });
  
        // Falling Objects Movement & Spawning
        const fallSpeed = 0.02 * gameSpeed;
        setFallingNTs(prev => prev.map(nt => ({ ...nt, y: nt.y + fallSpeed * deltaTime })).filter(nt => nt.y < 105));
        setPowerUps(prev => prev.map(pu => ({ ...pu, y: pu.y + fallSpeed * deltaTime })).filter(pu => pu.y < 105));
        
        spawnTimeRef.current += deltaTime;
        if (spawnTimeRef.current > 2000 / gameSpeed) {
            spawnTimeRef.current = 0;
            const randomNT = neurotransmitters[Math.floor(Math.random() * neurotransmitters.length)];
            setFallingNTs(prev => [...prev, { ...randomNT, id: Date.now() + Math.random(), x: Math.random() * 80 + 10, y: -5 }]);

            if (Math.random() < 0.1) {
                const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                setPowerUps(prev => [...prev, { ...randomPowerUp, type: randomPowerUp.name, id: Date.now() + Math.random(), x: Math.random() * 80 + 10, y: -5, active: false, endTime: 0 }]);
            }
        }
        
        targetTimeRef.current += deltaTime;
        if(targetTimeRef.current > 15000){
            targetTimeRef.current = 0;
            setCurrentTarget(neurotransmitters[Math.floor(Math.random() * neurotransmitters.length)]);
            setLevel(prev => prev + 1);
        }
  
        animationFrameId = requestAnimationFrame(gameLoop);
      };
  
      animationFrameId = requestAnimationFrame(gameLoop);
  
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [gameActive, gameSpeed, speedBoost, neurotransmitters, powerUpTypes]);
    
    // Collision Detection
    useEffect(() => {
        if (!gameActive) return;

        const collisionInterval = setInterval(() => {
            // NT Collisions
            setFallingNTs(prevNTs => {
                const remainingNTs = [];
                for (const nt of prevNTs) {
                    if (nt.y > 80 && nt.y < 95 && Math.abs(nt.x - playerPos) < 10) {
                        if (nt.name === currentTarget?.name) {
                            setArcadeScore(s => s + 100 * multiplier);
                            setCombo(c => c + 1);
                        } else if (!shieldActive) {
                            setLives(l => l - 1);
                            setCombo(0);
                        }
                    } else {
                        remainingNTs.push(nt);
                    }
                }
                return remainingNTs;
            });

            // Power-up Collisions
            setPowerUps(prevPUs => {
                const remainingPUs = [];
                for (const pu of prevPUs) {
                    if (pu.y > 80 && pu.y < 95 && Math.abs(pu.x - playerPos) < 12) {
                        const endTime = Date.now() + pu.duration;
                        setActivePowerUps(active => [...active, { ...pu, active: true, endTime }]);
                        if (pu.type === 'Speed Boost') setSpeedBoost(true);
                        if (pu.type === 'Score Multiplier') setMultiplier(3);
                        if (pu.type === 'Shield') setShieldActive(true);
                        if (pu.type === 'Slow Motion') setGameSpeed(0.5);
                    } else {
                        remainingPUs.push(pu);
                    }
                }
                return remainingPUs;
            });
        }, 50);

        return () => clearInterval(collisionInterval);
    }, [gameActive, playerPos, currentTarget, multiplier, shieldActive]);
    
    // Update active power-ups & combo
    useEffect(() => {
        if (!gameActive) return;
        setMaxCombo(prevMax => Math.max(prevMax, combo));
        const powerUpInterval = setInterval(() => {
            setActivePowerUps(prev => prev.filter(pu => {
                if (Date.now() > pu.endTime) {
                    if (pu.type === 'Speed Boost') setSpeedBoost(false);
                    if (pu.type === 'Score Multiplier') setMultiplier(1);
                    if (pu.type === 'Shield') setShieldActive(false);
                    if (pu.type === 'Slow Motion') setGameSpeed(1);
                    return false;
                }
                return true;
            }));
        }, 100);
        return () => clearInterval(powerUpInterval);
    }, [gameActive, combo]);

    // Check game over
    useEffect(() => {
      if (lives <= 0 && gameActive) {
        setGameActive(false);
        setHighScore(prev => Math.max(prev, arcadeScore));
      }
    }, [lives, gameActive, arcadeScore]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-black text-white rounded-xl shadow-lg font-mono">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-400 mb-2">🧠 NEURO DEFENDER 🧠</h2>
                <p className="text-green-300">Catch the correct neurotransmitters!</p>
            </div>
            <div className="flex justify-between items-center mb-4 text-green-400">
                <div>SCORE: {arcadeScore}</div>
                <div>HIGH SCORE: {highScore}</div>
                <div>LEVEL: {level}</div>
                <div>LIVES: {'❤️'.repeat(lives)}</div>
            </div>
            <div className="flex justify-between items-center mb-2 text-yellow-400 text-sm">
                <div>COMBO: {combo} (MAX: {maxCombo})</div>
                <div>MULTIPLIER: {multiplier}x</div>
                <div>TIME: {Math.floor(gameTime / 1000)}s</div>
            </div>
            {currentTarget && gameActive && (
                <div className="text-center mb-4 p-3 border-2 border-green-400 rounded">
                    <div className="text-yellow-400 font-bold">TARGET:</div>
                    <div className="text-xl">{currentTarget.icon} {currentTarget.name}</div>
                    <div className="text-sm text-green-300">{currentTarget.function}</div>
                </div>
            )}
            {gameActive && activePowerUps.length > 0 && (
                <div className="text-center mb-4 p-2 border border-yellow-400 rounded bg-yellow-900 bg-opacity-50">
                    <div className="text-yellow-400 font-bold text-sm">ACTIVE POWER-UPS:</div>
                    <div className="flex justify-center space-x-4 mt-1">
                        {activePowerUps.map(pu => (
                            <div key={pu.id} className="flex items-center space-x-1">
                                <span className={`${pu.color} p-1 rounded text-xs`}>{pu.icon}</span>
                                <span className="text-yellow-300 text-xs">{pu.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="relative bg-gray-900 border-2 border-green-400 rounded overflow-hidden" style={{ height: '400px' }}>
                {fallingNTs.map(nt => (
                    <div key={nt.id} className="absolute" style={{ left: `${nt.x}%`, top: `${nt.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={`w-8 h-8 ${nt.color} rounded-full flex items-center justify-center text-white font-bold border border-white text-xs`}>{nt.icon}</div>
                        <div className="text-xs text-center text-white mt-1">{nt.name.slice(0, 4)}</div>
                    </div>
                ))}
                {powerUps.map(pu => (
                    <div key={pu.id} className="absolute" style={{ left: `${pu.x}%`, top: `${pu.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={`w-10 h-10 ${pu.color} rounded-full flex items-center justify-center text-white font-bold border-2 border-yellow-300 text-lg animate-pulse`}>{pu.icon}</div>
                        <div className="text-xs text-center text-yellow-300 mt-1 font-bold">{pu.name.slice(0, 6)}</div>
                    </div>
                ))}
                {gameActive && (
                    <div className="absolute bottom-4" style={{ left: `${playerPos}%`, transform: 'translateX(-50%)' }}>
                        <div className={`w-12 h-8 bg-blue-500 rounded border-2 ${shieldActive ? 'border-yellow-300 animate-pulse' : 'border-white'} flex items-center justify-center text-lg`}>🧠</div>
                    </div>
                )}
                {!gameActive && lives <= 0 && arcadeScore > 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl text-red-400 mb-4">GAME OVER</div>
                            <div className="text-xl text-green-400 mb-4">Final Score: {arcadeScore}</div>
                            <button onClick={startGame} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold">PLAY AGAIN</button>
                        </div>
                    </div>
                )}
                {!gameActive && arcadeScore === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl text-green-400 mb-4">READY TO PLAY?</div>
                            <div className="text-lg text-green-300 mb-6">Use ←→ or A/D to move</div>
                            <button onClick={startGame} className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded text-white font-bold text-xl">START GAME</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 text-center">
                {gameActive ? (
                    <button onClick={resetGameState} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold">QUIT GAME</button>
                ) : (
                    <p className="text-sm text-green-300">Good luck!</p>
                )}
            </div>
        </div>
    );
});

const SynapseSimulator = ({ neurotransmitters }: {
  neurotransmitters: Neurotransmitter[];
}) => {
    const [selectedNT, setSelectedNT] = useState(0);
    const [isReleasing, setIsReleasing] = useState(false);
    const [synapseActivity, setSynapseActivity] = useState(0);

    const releaseBurst = () => {
        setIsReleasing(true);
        setSynapseActivity(100);
        setTimeout(() => {
            setIsReleasing(false);
        }, 1000);
    };

    useEffect(() => {
        const decay = setInterval(() => {
            setSynapseActivity(prev => Math.max(0, prev - 1));
        }, 100);
        return () => clearInterval(decay);
    }, []);

    const nt = neurotransmitters[selectedNT];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Synapse Simulator</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Select Neurotransmitter</h3>
                    <div className="space-y-2">
                        {neurotransmitters.map((neurotransmitter, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedNT(idx)}
                                className={`w-full p-3 text-left rounded-lg border transition-colors ${selectedNT === idx ? `${neurotransmitter.color} text-white` : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <span className="mr-2">{neurotransmitter.icon}</span>
                                {neurotransmitter.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Synapse Activity</h3>
                    <div className="relative bg-gray-100 rounded-lg p-8 mb-4">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">{nt.icon}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                <div className={`h-4 rounded-full transition-all duration-300 ${nt.color}`} style={{ width: `${synapseActivity}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Activity Level: {synapseActivity}%</p>
                            <button onClick={releaseBurst} disabled={isReleasing} className={`px-6 py-3 ${nt.color} text-white rounded-lg disabled:opacity-50 transition-all`}>
                                {isReleasing ? 'Releasing...' : 'Release Burst'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">{nt.name} Effects:</h4>
                        <p className="text-sm text-gray-700">{nt.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GameModeSelector = ({ gameMode, setGameMode, setCurrentLevel, setScore }: {
  gameMode: string;
  setGameMode: (mode: 'learn' | 'quiz' | 'arcade' | 'simulator') => void;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
        <Brain className="w-10 h-10 mr-3 text-blue-500" />
        Neurotransmitter Explorer
      </h1>
      <p className="text-gray-600 mb-8">Learn about the brain's chemical messengers</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => {setGameMode('learn'); setCurrentLevel(0);}}
          className={`px-6 py-3 rounded-lg transition-colors ${gameMode === 'learn' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <Lightbulb className="w-5 h-5 inline mr-2" />Learn Mode
        </button>
        <button
          onClick={() => {setGameMode('quiz'); setCurrentLevel(0); setScore(0);}}
          className={`px-6 py-3 rounded-lg transition-colors ${gameMode === 'quiz' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <Target className="w-5 h-5 inline mr-2" />Quiz Mode
        </button>
        <button
          onClick={() => setGameMode('arcade')}
          className={`px-6 py-3 rounded-lg transition-colors ${gameMode === 'arcade' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <Zap className="w-5 h-5 inline mr-2" />Arcade Game
        </button>
        <button
          onClick={() => setGameMode('simulator')}
          className={`px-6 py-3 rounded-lg transition-colors ${gameMode === 'simulator' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <Brain className="w-5 h-5 inline mr-2" />Synapse Simulator
        </button>
      </div>
    </div>
);


// --- MAIN COMPONENT ---
const NeurotransmitterGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<'learn' | 'quiz' | 'simulator' | 'arcade'>('learn');

  const neurotransmitters: Neurotransmitter[] = useMemo(() => [
    { name: 'Dopamine', icon: '🎯', color: 'bg-purple-500', function: 'Reward & Motivation', description: 'Controls pleasure, reward, and motivation. Essential for goal-directed behavior.', effects: ['Pleasure and reward', 'Motivation', 'Motor control', 'Focus'], disorders: ['Parkinson\'s Disease (low)', 'Addiction (dysregulation)', 'ADHD (low)'], facts: 'Made in the substantia nigra and ventral tegmental area' },
    { name: 'Serotonin', icon: '😊', color: 'bg-blue-500', function: 'Mood & Happiness', description: 'Regulates mood, sleep, appetite, and social behavior. Often called the "happiness chemical".', effects: ['Mood regulation', 'Sleep cycles', 'Appetite control', 'Social behavior'], disorders: ['Depression (low)', 'Anxiety disorders', 'OCD'], facts: '90% of serotonin is produced in the gut!' },
    { name: 'GABA', icon: '😌', color: 'bg-green-500', function: 'Calm & Relaxation', description: 'The main inhibitory neurotransmitter. Reduces neuronal excitability and promotes calm.', effects: ['Reduces anxiety', 'Muscle relaxation', 'Sleep promotion', 'Seizure prevention'], disorders: ['Anxiety disorders (low)', 'Epilepsy (low)', 'Insomnia'], facts: 'GABA stands for Gamma-Aminobutyric Acid' },
    { name: 'Norepinephrine', icon: '⚡', color: 'bg-orange-500', function: 'Alertness & Energy', description: 'Acts as both hormone and neurotransmitter. Controls alertness and arousal.', effects: ['Increased alertness', 'Fight-or-flight response', 'Attention', 'Heart rate increase'], disorders: ['Depression (low)', 'ADHD', 'Anxiety (high)'], facts: 'Also known as noradrenaline' },
    { name: 'Acetylcholine', icon: '🧠', color: 'bg-indigo-500', function: 'Memory & Learning', description: 'Key for memory formation, learning, and muscle movement.', effects: ['Memory formation', 'Learning', 'Muscle contraction', 'Attention'], disorders: ['Alzheimer\'s Disease (low)', 'Myasthenia Gravis', 'Memory problems'], facts: 'The first neurotransmitter discovered' },
    { name: 'Endorphins', icon: '🏃', color: 'bg-pink-500', function: 'Natural Pain Relief', description: 'Body\'s natural opioids. Reduce pain and create feelings of euphoria.', effects: ['Pain relief', 'Euphoria', 'Stress reduction', 'Mood enhancement'], disorders: ['Chronic pain', 'Depression', 'Stress disorders'], facts: 'Released during exercise, laughter, and eating chocolate' }
  ], []);

  const powerUpTypes: PowerUp[] = useMemo(() => [
    { name: 'Speed Boost', icon: '⚡', color: 'bg-yellow-500', effect: 'Doubles movement speed for 5 seconds', duration: 5000 },
    { name: 'Score Multiplier', icon: '🎯', color: 'bg-purple-500', effect: '3x score multiplier for 10 seconds', duration: 10000 },
    { name: 'Shield', icon: '🛡️', color: 'bg-blue-500', effect: 'Protects from wrong catches for 8 seconds', duration: 8000 },
    { name: 'Slow Motion', icon: '⏰', color: 'bg-green-500', effect: 'Slows down falling NTs for 6 seconds', duration: 6000 }
  ], []);

  const quizQuestions = useMemo(() => [
    { question: "Which neurotransmitter is often called the 'happiness chemical'?", options: ['Dopamine', 'Serotonin', 'GABA', 'Norepinephrine'], correct: 1, explanation: "Serotonin regulates mood and is often called the happiness chemical." },
    { question: "What is the main function of GABA?", options: ['Excitation', 'Inhibition', 'Memory', 'Movement'], correct: 1, explanation: "GABA is the main inhibitory neurotransmitter, reducing neural activity." },
    { question: "Which neurotransmitter is associated with Parkinson's Disease?", options: ['Serotonin', 'GABA', 'Dopamine', 'Acetylcholine'], correct: 2, explanation: "Low dopamine levels are associated with Parkinson's Disease." },
    { question: "Where is 90% of serotonin produced?", options: ['Brain', 'Gut', 'Heart', 'Liver'], correct: 1, explanation: "Surprisingly, 90% of serotonin is produced in the gut!" }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <GameModeSelector 
        gameMode={gameMode} 
        setGameMode={setGameMode} 
        setCurrentLevel={setCurrentLevel} 
        setScore={setScore} 
      />
      
      {gameMode === 'learn' && <LearnMode neurotransmitters={neurotransmitters} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />}
      {gameMode === 'quiz' && <QuizMode quizQuestions={quizQuestions} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} score={score} setScore={setScore} />}
      {gameMode === 'arcade' && <ArcadeGame neurotransmitters={neurotransmitters} powerUpTypes={powerUpTypes} />}
      {gameMode === 'simulator' && <SynapseSimulator neurotransmitters={neurotransmitters} />}
      
      <div className="text-center mt-8">
        <button
          onClick={() => {setGameMode('learn'); setCurrentLevel(0); setScore(0);}}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Reset to Learn Mode
        </button>
      </div>
    </div>
  );
};

export default NeurotransmitterGame;