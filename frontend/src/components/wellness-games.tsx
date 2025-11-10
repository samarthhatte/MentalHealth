import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Target, 
  Sparkles, 
  Star,
  Timer,
  Award
} from 'lucide-react';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface ColorSequence {
  color: string;
  isActive: boolean;
}

const memoryEmojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌊', '☀️', '🌙'];
const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function WellnessGames() {
  const [selectedGame, setSelectedGame] = useState<'memory' | 'simon' | 'breathing-focus' | null>(null);
  const [gameStats, setGameStats] = useState({
    memoryBest: 0,
    simonBest: 0,
    gamesPlayed: 0,
    totalScore: 0
  });

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);

  // Simon Game State
  const [simonSequence, setSimonSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simonScore, setSimonScore] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  // Breathing Focus Game State
  const [focusScore, setFocusScore] = useState(0);
  const [focusLevel, setFocusLevel] = useState(0);
  const [focusTimer, setFocusTimer] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);

  useEffect(() => {
    const savedStats = localStorage.getItem('wellnessGameStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  const saveStats = (newStats: typeof gameStats) => {
    setGameStats(newStats);
    localStorage.setItem('wellnessGameStats', JSON.stringify(newStats));
  };

  // Memory Game Functions
  const initializeMemoryGame = () => {
    const shuffledEmojis = [...memoryEmojis, ...memoryEmojis]
      .sort(() => Math.random() - 0.5);
    
    const cards = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    setMemoryCards(cards);
    setFlippedCards([]);
    setMatches(0);
    setMemoryMoves(0);
    setMemoryScore(1000);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (memoryCards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMemoryMoves(prev => prev + 1);
      setMemoryScore(prev => Math.max(0, prev - 50));

      const [firstCard, secondCard] = newFlippedCards;
      if (memoryCards[firstCard].emoji === memoryCards[secondCard].emoji) {
        // Match found
        setMemoryCards(prev => prev.map(card => 
          card.id === firstCard || card.id === secondCard
            ? { ...card, isMatched: true }
            : card
        ));
        setMatches(prev => prev + 1);
        setFlippedCards([]);
        setMemoryScore(prev => prev + 200);
        
        if (matches + 1 === memoryEmojis.length) {
          // Game complete
          const finalScore = Math.max(0, memoryScore + 200);
          saveStats({
            ...gameStats,
            memoryBest: Math.max(gameStats.memoryBest, finalScore),
            gamesPlayed: gameStats.gamesPlayed + 1,
            totalScore: gameStats.totalScore + finalScore
          });
        }
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Simon Game Functions
  const startSimonGame = () => {
    const newSequence = [Math.floor(Math.random() * colors.length)];
    setSimonSequence(newSequence);
    setPlayerSequence([]);
    setCurrentStep(0);
    setSimonScore(0);
    setIsPlaying(true);
    showSequence(newSequence);
  };

  const showSequence = (sequence: number[]) => {
    setIsShowingSequence(true);
    sequence.forEach((colorIndex, index) => {
      setTimeout(() => {
        // Flash color
        setTimeout(() => {
          if (index === sequence.length - 1) {
            setIsShowingSequence(false);
          }
        }, 600);
      }, index * 800);
    });
  };

  const handleColorPress = (colorIndex: number) => {
    if (!isPlaying || isShowingSequence) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[currentStep] !== simonSequence[currentStep]) {
      // Wrong color, game over
      setIsPlaying(false);
      saveStats({
        ...gameStats,
        simonBest: Math.max(gameStats.simonBest, simonScore),
        gamesPlayed: gameStats.gamesPlayed + 1,
        totalScore: gameStats.totalScore + simonScore
      });
      return;
    }

    if (newPlayerSequence.length === simonSequence.length) {
      // Level complete
      const newScore = simonScore + simonSequence.length * 100;
      setSimonScore(newScore);
      
      // Add new color to sequence
      const nextSequence = [...simonSequence, Math.floor(Math.random() * colors.length)];
      setSimonSequence(nextSequence);
      setPlayerSequence([]);
      setCurrentStep(0);
      
      setTimeout(() => showSequence(nextSequence), 1000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Breathing Focus Game Functions
  const startFocusGame = () => {
    setIsFocusActive(true);
    setFocusScore(0);
    setFocusLevel(50);
    setFocusTimer(60); // 60 seconds
    
    const interval = setInterval(() => {
      setFocusTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFocusActive(false);
          saveStats({
            ...gameStats,
            gamesPlayed: gameStats.gamesPlayed + 1,
            totalScore: gameStats.totalScore + focusScore
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFocusClick = () => {
    if (!isFocusActive) return;
    
    const accuracy = Math.random() * 0.4 + 0.8; // 80-120% accuracy
    const points = Math.floor(accuracy * 100);
    
    setFocusScore(prev => prev + points);
    setFocusLevel(prev => Math.min(100, prev + 5));
  };

  const GameCard = ({ title, description, icon, onStart, bestScore, difficulty }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onStart: () => void;
    bestScore?: number;
    difficulty: string;
  }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onStart}>
      <div className="text-center space-y-4">
        <div className="text-4xl">{icon}</div>
        <h3>{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{difficulty}</Badge>
          {bestScore !== undefined && bestScore > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              {bestScore}
            </div>
          )}
        </div>
        <Button className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Play
        </Button>
      </div>
    </Card>
  );

  if (selectedGame === 'memory') {
    const isComplete = matches === memoryEmojis.length;
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Memory Garden
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Moves:</span> {memoryMoves}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Score:</span> {memoryScore}
              </div>
              <Button variant="outline" onClick={() => setSelectedGame(null)}>
                Back to Games
              </Button>
            </div>
          </div>

          {memoryCards.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-4">Memory Garden</h3>
              <p className="text-muted-foreground mb-6">
                Match pairs of beautiful flowers to create your peaceful garden. 
                This game helps improve memory and concentration.
              </p>
              <Button onClick={initializeMemoryGame}>
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {memoryCards.map((card) => (
                  <motion.div
                    key={card.id}
                    className={`aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center text-2xl transition-colors ${
                      card.isMatched
                        ? 'bg-green-100 border-green-300 dark:bg-green-900'
                        : flippedCards.includes(card.id)
                        ? 'bg-blue-100 border-blue-300 dark:bg-blue-900'
                        : 'bg-gray-100 border-gray-300 dark:bg-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => flipCard(card.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {(flippedCards.includes(card.id) || card.isMatched) ? card.emoji : '🌿'}
                  </motion.div>
                ))}
              </div>

              {isComplete && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Award className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-green-800 dark:text-green-200 mb-2">Garden Complete!</h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    You completed the memory garden in {memoryMoves} moves with a score of {memoryScore}!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={initializeMemoryGame}>Play Again</Button>
                    <Button variant="outline" onClick={() => setSelectedGame(null)}>
                      Back to Games
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  if (selectedGame === 'simon') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Color Harmony
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Level:</span> {simonSequence.length}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Score:</span> {simonScore}
              </div>
              <Button variant="outline" onClick={() => setSelectedGame(null)}>
                Back to Games
              </Button>
            </div>
          </div>

          {!isPlaying ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-4">Color Harmony</h3>
              <p className="text-muted-foreground mb-6">
                Watch the sequence of colors and repeat it back. 
                This game enhances attention and working memory.
              </p>
              <Button onClick={startSimonGame}>
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {isShowingSequence ? 'Watch the sequence...' : 'Repeat the pattern'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {colors.map((color, index) => (
                  <motion.button
                    key={index}
                    className="aspect-square rounded-lg border-4 border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorPress(index)}
                    disabled={isShowingSequence}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              {!isPlaying && simonScore > 0 && (
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-blue-800 dark:text-blue-200 mb-2">Game Over!</h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    You reached level {simonSequence.length - 1} with a score of {simonScore}!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={startSimonGame}>Play Again</Button>
                    <Button variant="outline" onClick={() => setSelectedGame(null)}>
                      Back to Games
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (selectedGame === 'breathing-focus') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Mindful Focus
            </h2>
            <div className="flex items-center gap-4">
              {isFocusActive && (
                <>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    {focusTimer}s
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Score:</span> {focusScore}
                  </div>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedGame(null)}>
                Back to Games
              </Button>
            </div>
          </div>

          {!isFocusActive && focusTimer === 0 && focusScore === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-4">Mindful Focus</h3>
              <p className="text-muted-foreground mb-6">
                Click the pulsing circle in rhythm with your breathing. 
                Stay focused and calm to earn points.
              </p>
              <Button onClick={startFocusGame}>
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Progress value={focusLevel} className="w-48 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Breathe deeply and click the circle in rhythm
                </p>
              </div>

              <div className="text-center">
                <motion.button
                  className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mx-auto flex items-center justify-center"
                  onClick={handleFocusClick}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  disabled={!isFocusActive}
                >
                  <span className="text-white text-xl">Breathe</span>
                </motion.button>
              </div>

              {focusTimer === 0 && focusScore > 0 && (
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Award className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-purple-800 dark:text-purple-200 mb-2">Session Complete!</h3>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    Great mindfulness practice! You scored {focusScore} points.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={startFocusGame}>Practice Again</Button>
                    <Button variant="outline" onClick={() => setSelectedGame(null)}>
                      Back to Games
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Wellness Games
        </h2>
        
        {gameStats.gamesPlayed > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4>Games Played</h4>
              <p className="text-2xl text-blue-600">{gameStats.gamesPlayed}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4>Memory Best</h4>
              <p className="text-2xl text-green-600">{gameStats.memoryBest}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <h4>Simon Best</h4>
              <p className="text-2xl text-purple-600">{gameStats.simonBest}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h4>Total Score</h4>
              <p className="text-2xl text-yellow-600">{gameStats.totalScore}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GameCard
            title="Memory Garden"
            description="Match pairs of beautiful flowers to improve memory and concentration"
            icon="🌸"
            onStart={() => setSelectedGame('memory')}
            bestScore={gameStats.memoryBest}
            difficulty="Easy"
          />
          
          <GameCard
            title="Color Harmony"
            description="Remember and repeat color sequences to enhance working memory"
            icon="🌈"
            onStart={() => setSelectedGame('simon')}
            bestScore={gameStats.simonBest}
            difficulty="Medium"
          />
          
          <GameCard
            title="Mindful Focus"
            description="Practice breathing and mindfulness to improve attention"
            icon="🎯"
            onStart={() => setSelectedGame('breathing-focus')}
            difficulty="Easy"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4">Benefits of Wellness Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Cognitive Benefits
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Improves memory and attention</li>
              <li>• Enhances problem-solving skills</li>
              <li>• Increases mental flexibility</li>
              <li>• Boosts processing speed</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Emotional Benefits
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Reduces stress and anxiety</li>
              <li>• Increases sense of accomplishment</li>
              <li>• Promotes mindfulness</li>
              <li>• Improves mood</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Wellness Benefits
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Encourages relaxation</li>
              <li>• Provides healthy distraction</li>
              <li>• Builds resilience</li>
              <li>• Supports mental fitness</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}