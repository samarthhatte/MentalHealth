import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
}

const breathingPatterns: BreathingPattern[] = [
  { name: '4-7-8 Technique', inhale: 4, hold: 7, exhale: 8, cycles: 4 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, cycles: 4 },
  { name: 'Equal Breathing', inhale: 4, hold: 0, exhale: 4, cycles: 6 },
  { name: 'Calming Breath', inhale: 4, hold: 2, exhale: 6, cycles: 5 },
];

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'complete';

export function BreathingExercise() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('ready');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale;

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTotalTime(prev => prev + 0.1);
        setPhaseTime(prev => {
          const newPhaseTime = prev + 0.1;
          const phaseProgress = (newPhaseTime / getCurrentPhaseDuration()) * 100;
          setProgress(phaseProgress);

          if (newPhaseTime >= getCurrentPhaseDuration()) {
            moveToNextPhase();
            return 0;
          }
          return newPhaseTime;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, selectedPattern]);

  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return selectedPattern.inhale;
      case 'hold': return selectedPattern.hold;
      case 'exhale': return selectedPattern.exhale;
      default: return 0;
    }
  };

  const moveToNextPhase = () => {
    setPhaseTime(0);
    setProgress(0);

    switch (currentPhase) {
      case 'ready':
        setCurrentPhase('inhale');
        break;
      case 'inhale':
        if (selectedPattern.hold > 0) {
          setCurrentPhase('hold');
        } else {
          setCurrentPhase('exhale');
        }
        break;
      case 'hold':
        setCurrentPhase('exhale');
        break;
      case 'exhale':
        setCurrentCycle(prev => {
          const newCycle = prev + 1;
          if (newCycle >= selectedPattern.cycles) {
            setCurrentPhase('complete');
            setIsActive(false);
            return newCycle;
          } else {
            setCurrentPhase('inhale');
            return newCycle;
          }
        });
        break;
    }
  };

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setCurrentCycle(0);
    setPhaseTime(0);
    setProgress(0);
    setTotalTime(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('ready');
    setCurrentCycle(0);
    setPhaseTime(0);
    setProgress(0);
    setTotalTime(0);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'ready': return 'Ready to begin';
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'complete': return 'Exercise Complete!';
    }
  };

  const getCircleScale = () => {
    switch (currentPhase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Pattern Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" />
          <h3>Select Breathing Pattern</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {breathingPatterns.map((pattern, index) => (
            <Button
              key={index}
              variant={selectedPattern.name === pattern.name ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setSelectedPattern(pattern);
                resetExercise();
              }}
            >
              <div className="w-full text-left">
                <p className="mb-1">{pattern.name}</p>
                <p className="text-sm opacity-70">
                  {pattern.inhale}s-{pattern.hold}s-{pattern.exhale}s
                </p>
                <p className="text-xs opacity-50">
                  {pattern.cycles} cycles
                </p>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Breathing Animation */}
      <Card className="p-8 text-center">
        <div className="space-y-8">
          <div className="relative w-64 h-64 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: getCurrentPhaseDuration(),
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-40"
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: getCurrentPhaseDuration(),
                ease: "easeInOut",
                delay: 0.1,
              }}
            />
            <motion.div
              className="absolute inset-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 opacity-60"
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: getCurrentPhaseDuration(),
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-2">{getPhaseText()}</p>
                <p className="text-lg text-muted-foreground">
                  {Math.ceil(getCurrentPhaseDuration() - phaseTime)}s
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="w-64 mx-auto" />
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">
                Cycle {currentCycle + 1} of {selectedPattern.cycles}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {!isActive && currentPhase === 'ready' && (
              <Button onClick={startExercise} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Start Exercise
              </Button>
            )}
            {isActive && (
              <Button onClick={pauseExercise} size="lg" variant="outline">
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            {!isActive && currentPhase !== 'ready' && currentPhase !== 'complete' && (
              <Button onClick={() => setIsActive(true)} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            )}
            <Button onClick={resetExercise} size="lg" variant="outline">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          {currentPhase === 'complete' && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-green-700 dark:text-green-300">
                🎉 Great job! You've completed your breathing exercise. 
                Take a moment to notice how you feel.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="mb-4">How to Practice</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-blue-600 dark:text-blue-400 mb-2">👃 Inhale</div>
            <p>Breathe in slowly through your nose for {selectedPattern.inhale} seconds</p>
          </div>
          {selectedPattern.hold > 0 && (
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-purple-600 dark:text-purple-400 mb-2">⏸️ Hold</div>
              <p>Hold your breath gently for {selectedPattern.hold} seconds</p>
            </div>
          )}
          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-green-600 dark:text-green-400 mb-2">👄 Exhale</div>
            <p>Breathe out slowly through your mouth for {selectedPattern.exhale} seconds</p>
          </div>
        </div>
      </Card>
    </div>
  );
}