import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Smile, 
  Heart, 
  Star, 
  RefreshCw, 
  BookOpen, 
  Lightbulb,
  Quote,
  Sparkles,
  Sun,
  Target
} from 'lucide-react';

interface Quote {
  text: string;
  author: string;
  category: 'motivation' | 'mindfulness' | 'success' | 'happiness';
}

interface Joke {
  setup: string;
  punchline: string;
  category: 'clean' | 'motivational' | 'mindful';
}

interface Tip {
  title: string;
  content: string;
  category: 'wellness' | 'productivity' | 'mindfulness' | 'self-care';
}

const motivationalQuotes: Quote[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "mindfulness"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "happiness"
  },
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh",
    category: "mindfulness"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Yesterday is history, tomorrow is a mystery, today is a gift.",
    author: "Eleanor Roosevelt",
    category: "mindfulness"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "motivation"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "happiness"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "mindfulness"
  }
];

const wellnessJokes: Joke[] = [
  {
    setup: "Why did the meditation teacher refuse Novocaine?",
    punchline: "She wanted to transcend dental medication!",
    category: "mindful"
  },
  {
    setup: "What did one yoga block say to the other?",
    punchline: "You're really supporting me through this!",
    category: "motivational"
  },
  {
    setup: "Why don't stress balls ever get tired?",
    punchline: "Because they always bounce back!",
    category: "clean"
  },
  {
    setup: "What's a mindfulness teacher's favorite type of music?",
    punchline: "Present-tense music!",
    category: "mindful"
  },
  {
    setup: "Why did the positive thinker bring a ladder to the bar?",
    punchline: "Because they heard the drinks were on the house!",
    category: "motivational"
  },
  {
    setup: "What do you call a sleeping bull at a meditation retreat?",
    punchline: "A bulldozer in deep relaxation!",
    category: "mindful"
  },
  {
    setup: "Why did the self-help book go to therapy?",
    punchline: "It had too many issues to work through!",
    category: "motivational"
  },
  {
    setup: "What's the best thing about Switzerland during meditation?",
    punchline: "I don't know, but the flag is a big plus for inner peace!",
    category: "clean"
  }
];

const wellnessTips: Tip[] = [
  {
    title: "5-Minute Morning Routine",
    content: "Start your day with 5 minutes of deep breathing, stretching, and setting a positive intention.",
    category: "wellness"
  },
  {
    title: "The 20-20-20 Rule",
    content: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain and mental fatigue.",
    category: "productivity"
  },
  {
    title: "Mindful Eating",
    content: "Eat slowly and pay attention to flavors, textures, and how food makes you feel.",
    category: "mindfulness"
  },
  {
    title: "Gratitude Practice",
    content: "Write down three things you're grateful for each day. This simple practice can boost happiness and reduce stress.",
    category: "wellness"
  },
  {
    title: "Digital Detox Hour",
    content: "Dedicate one hour before bed to being screen-free. Read, meditate, or practice gentle stretching instead.",
    category: "self-care"
  },
  {
    title: "Progressive Muscle Relaxation",
    content: "Tense and then relax each muscle group in your body, starting from your toes and working up to your head.",
    category: "wellness"
  },
  {
    title: "Two-Minute Rule",
    content: "If a task takes less than two minutes, do it immediately. This prevents small tasks from piling up.",
    category: "productivity"
  },
  {
    title: "Nature Breaks",
    content: "Spend at least 10 minutes outside each day. Fresh air and nature can significantly improve mood and clarity.",
    category: "self-care"
  },
  {
    title: "Loving-Kindness Meditation",
    content: "Send positive thoughts to yourself, loved ones, neutral people, difficult people, and all beings.",
    category: "mindfulness"
  },
  {
    title: "Hydration Reminder",
    content: "Drink a glass of water every hour. Proper hydration improves mood, energy, and cognitive function.",
    category: "wellness"
  }
];

export function MotivationalContent() {
  const [activeSection, setActiveSection] = useState<'quotes' | 'jokes' | 'tips'>('quotes');
  const [currentQuote, setCurrentQuote] = useState<Quote>(motivationalQuotes[0]);
  const [currentJoke, setCurrentJoke] = useState<Joke>(wellnessJokes[0]);
  const [currentTip, setCurrentTip] = useState<Tip>(wellnessTips[0]);
  const [favorites, setFavorites] = useState<{
    quotes: Quote[];
    jokes: Joke[];
    tips: Tip[];
  }>({ quotes: [], jokes: [], tips: [] });
  const [showJokePunchline, setShowJokePunchline] = useState(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('motivationalFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const saveFavorites = (newFavorites: typeof favorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('motivationalFavorites', JSON.stringify(newFavorites));
  };

  const getRandomQuote = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
  };

  const getRandomJoke = () => {
    const randomJoke = wellnessJokes[Math.floor(Math.random() * wellnessJokes.length)];
    setCurrentJoke(randomJoke);
    setShowJokePunchline(false);
  };

  const getRandomTip = () => {
    const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    setCurrentTip(randomTip);
  };

  const addToFavorites = (type: 'quotes' | 'jokes' | 'tips', item: any) => {
    const newFavorites = {
      ...favorites,
      [type]: [...favorites[type], item]
    };
    saveFavorites(newFavorites);
  };

  const removeFromFavorites = (type: 'quotes' | 'jokes' | 'tips', item: any) => {
    const newFavorites = {
      ...favorites,
      [type]: favorites[type].filter(fav => JSON.stringify(fav) !== JSON.stringify(item))
    };
    saveFavorites(newFavorites);
  };

  const isFavorite = (type: 'quotes' | 'jokes' | 'tips', item: any) => {
    return favorites[type].some(fav => JSON.stringify(fav) === JSON.stringify(item));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      motivation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      mindfulness: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      success: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      happiness: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      wellness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      productivity: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'self-care': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      clean: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      motivational: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      mindful: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    };
    return colors[category as keyof typeof colors] || colors.motivation;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Sparkles className="w-6 h-6" />
          <h2>Daily Inspiration</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === 'quotes' ? 'default' : 'outline'}
            onClick={() => setActiveSection('quotes')}
            className="flex items-center gap-2"
          >
            <Quote className="w-4 h-4" />
            Inspirational Quotes
          </Button>
          <Button
            variant={activeSection === 'jokes' ? 'default' : 'outline'}
            onClick={() => setActiveSection('jokes')}
            className="flex items-center gap-2"
          >
            <Smile className="w-4 h-4" />
            Wellness Humor
          </Button>
          <Button
            variant={activeSection === 'tips' ? 'default' : 'outline'}
            onClick={() => setActiveSection('tips')}
            className="flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Wellness Tips
          </Button>
        </div>
      </Card>

      {/* Quotes Section */}
      {activeSection === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-8 text-center">
              <Quote className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
              <blockquote className="text-xl italic mb-4">
                "{currentQuote.text}"
              </blockquote>
              <p className="text-muted-foreground mb-6">— {currentQuote.author}</p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge className={getCategoryColor(currentQuote.category)}>
                  {currentQuote.category}
                </Badge>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={getRandomQuote} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  New Quote
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isFavorite('quotes', currentQuote)) {
                      removeFromFavorites('quotes', currentQuote);
                    } else {
                      addToFavorites('quotes', currentQuote);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite('quotes', currentQuote) ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite('quotes', currentQuote) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                Favorite Quotes
              </h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {favorites.quotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No favorite quotes yet. Click the heart to save quotes you love!
                    </p>
                  ) : (
                    favorites.quotes.map((quote, index) => (
                      <div key={index} className="p-3 border rounded-lg text-sm">
                        <p className="italic mb-2">"{quote.text}"</p>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">— {quote.author}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromFavorites('quotes', quote)}
                          >
                            <Heart className="w-3 h-3 fill-current text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}

      {/* Jokes Section */}
      {activeSection === 'jokes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-8 text-center">
              <Smile className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
              <div className="mb-6">
                <p className="text-lg mb-4">{currentJoke.setup}</p>
                {showJokePunchline && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 italic">
                    {currentJoke.punchline}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge className={getCategoryColor(currentJoke.category)}>
                  {currentJoke.category}
                </Badge>
              </div>

              <div className="flex justify-center gap-4">
                {!showJokePunchline ? (
                  <Button onClick={() => setShowJokePunchline(true)}>
                    Show Punchline
                  </Button>
                ) : (
                  <Button onClick={getRandomJoke} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    New Joke
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isFavorite('jokes', currentJoke)) {
                      removeFromFavorites('jokes', currentJoke);
                    } else {
                      addToFavorites('jokes', currentJoke);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite('jokes', currentJoke) ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite('jokes', currentJoke) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                Favorite Jokes
              </h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {favorites.jokes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No favorite jokes yet. Save the ones that make you smile!
                    </p>
                  ) : (
                    favorites.jokes.map((joke, index) => (
                      <div key={index} className="p-3 border rounded-lg text-sm">
                        <p className="mb-2">{joke.setup}</p>
                        <p className="italic text-blue-600 dark:text-blue-400 mb-2">
                          {joke.punchline}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {joke.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromFavorites('jokes', joke)}
                          >
                            <Heart className="w-3 h-3 fill-current text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {activeSection === 'tips' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="text-center mb-6">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl mb-2">{currentTip.title}</h3>
                <Badge className={getCategoryColor(currentTip.category)}>
                  {currentTip.category}
                </Badge>
              </div>

              <p className="text-center mb-6 leading-relaxed">
                {currentTip.content}
              </p>

              <div className="flex justify-center gap-4">
                <Button onClick={getRandomTip} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  New Tip
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isFavorite('tips', currentTip)) {
                      removeFromFavorites('tips', currentTip);
                    } else {
                      addToFavorites('tips', currentTip);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite('tips', currentTip) ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite('tips', currentTip) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                Favorite Tips
              </h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {favorites.tips.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No favorite tips yet. Save the ones you want to remember!
                    </p>
                  ) : (
                    favorites.tips.map((tip, index) => (
                      <div key={index} className="p-3 border rounded-lg text-sm">
                        <h4 className="mb-2">{tip.title}</h4>
                        <p className="text-muted-foreground mb-2">{tip.content}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {tip.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromFavorites('tips', tip)}
                          >
                            <Heart className="w-3 h-3 fill-current text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}

      {/* Daily Inspiration Stats */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5" />
          Your Inspiration Journey
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h4>Quotes Saved</h4>
            <p className="text-2xl text-blue-600">{favorites.quotes.length}</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <Smile className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4>Jokes Saved</h4>
            <p className="text-2xl text-green-600">{favorites.jokes.length}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4>Tips Saved</h4>
            <p className="text-2xl text-purple-600">{favorites.tips.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}