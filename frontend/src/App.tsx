import { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import { motion } from 'motion/react';
import {
  MessageCircle,
  BookOpen,
  Wind,
  Volume2,
  Gamepad2,
  Activity,
  Users,
  Globe,
  Book,
  Smile,
  Stethoscope,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Star,
  Target,
  Home,
  Menu,
  X
} from 'lucide-react';

// Import all components
import { AIChat } from './components/ai-chat';
import { Journal } from './components/journal';
import { BreathingExercise } from './components/breathing-exercise';
import { CalmingSounds } from './components/calming-sounds';
import { WellnessGames } from './components/wellness-games';
import { MentalHealthAssessment } from './components/mental-health-assessment';
import { TherapistConnect } from './components/therapist-connect';
import { Translation } from './components/translation';
import { BookReader } from './components/book-reader';
import { MotivationalContent } from './components/motivational-content';
import { ImmersiveEnvironment } from './components/immersive-environment';
import { EmotionAssistant } from './components/emotion-analyzer';


interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'wellness' | 'interactive' | 'content' | 'support';
}

const features: Feature[] = [
  {
    id: 'chat',
    name: 'AI Companion',
    description: 'Chat with a supportive AI friend',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'bg-blue-500',
    category: 'support'
  },
  {
    id: 'journal',
    name: 'Digital Journal',
    description: 'Write and track your feelings',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-green-500',
    category: 'wellness'
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    description: 'Guided breathing with animations',
    icon: <Wind className="w-5 h-5" />,
    color: 'bg-purple-500',
    category: 'wellness'
  },
  {
    id: 'sounds',
    name: 'Calming Sounds',
    description: 'Relaxing ambient soundscapes',
    icon: <Volume2 className="w-5 h-5" />,
    color: 'bg-cyan-500',
    category: 'wellness'
  },
  {
    id: 'games',
    name: 'Wellness Games',
    description: 'Fun games for mental wellness',
    icon: <Gamepad2 className="w-5 h-5" />,
    color: 'bg-orange-500',
    category: 'interactive'
  },
  {
    id: 'assessment',
    name: 'Mental Health Check',
    description: 'Track your mental wellbeing',
    icon: <Activity className="w-5 h-5" />,
    color: 'bg-red-500',
    category: 'wellness'
  },
  {
    id: 'therapist',
    name: 'Therapist Connect',
    description: 'Find professional support',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'bg-teal-500',
    category: 'support'
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Access content in your language',
    icon: <Globe className="w-5 h-5" />,
    color: 'bg-indigo-500',
    category: 'support'
  },
  {
    id: 'books',
    name: 'Wellness Library',
    description: 'Read uplifting books and articles',
    icon: <Book className="w-5 h-5" />,
    color: 'bg-yellow-500',
    category: 'content'
  },
  {
    id: 'motivation',
    name: 'Daily Inspiration',
    description: 'Quotes, jokes, and wellness tips',
    icon: <Smile className="w-5 h-5" />,
    color: 'bg-pink-500',
    category: 'content'
  },
  {
    id: 'environment',
    name: 'Calm Environments',
    description: 'Immersive relaxing experiences',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-violet-500',
    category: 'interactive'
  },
  {
  id: 'emotion',
  name: 'Emotion Analyzer',
  description: 'Detect mood & get wellness suggestions',
  icon: <Smile className="w-5 h-5" />,
  color: 'bg-rose-500',
  category: 'wellness'
},

];

export default function App() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      setIsDarkMode(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    }

    // Load user name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'chat': return <AIChat />;
      case 'journal': return <Journal />;
      case 'breathing': return <BreathingExercise />;
      case 'sounds': return <CalmingSounds />;
      case 'games': return <WellnessGames />;
      case 'assessment': return <MentalHealthAssessment />;
      case 'therapist': return <TherapistConnect />;
      case 'translation': return <Translation />;
      case 'books': return <BookReader />;
      case 'motivation': return <MotivationalContent />;
      case 'environment': return <ImmersiveEnvironment />;
      case 'emotion': return <EmotionAssistant />;

      default: return null;
    }
  };

  const FeatureCard = ({ feature }: { feature: Feature }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setActiveFeature(feature.id)}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${feature.color} text-white`}>
            {feature.icon}
          </div>
          <div className="flex-1">
            <h3 className="mb-2">{feature.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
            <Badge variant="secondary" className="capitalize">
              {feature.category}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (activeFeature) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setActiveFeature(null)}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {renderFeatureContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl">MindfulSpace</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-6xl mb-4"
            >
              🌸
            </motion.div>
            <h2 className="text-3xl mb-4">
              {getGreeting()}{userName && `, ${userName}`}! 
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to your personal mental wellness companion. Take a moment to breathe, 
              reflect, and nurture your mental health with our comprehensive toolkit.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>12 Wellness Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span>Personalized Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Always Available</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FeatureCard feature={feature} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {['wellness', 'interactive', 'content', 'support'].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features
                  .filter((feature) => feature.category === category)
                  .map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <h3 className="text-xl mb-4">Quick Start Recommendations</h3>
            <p className="text-muted-foreground mb-6">
              New to mental wellness? Start with these gentle, beginner-friendly tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setActiveFeature('breathing')}
                className="flex items-center gap-2"
              >
                <Wind className="w-4 h-4" />
                5-Minute Breathing
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveFeature('sounds')}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Calming Sounds
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveFeature('motivation')}
                className="flex items-center gap-2"
              >
                <Smile className="w-4 h-4" />
                Daily Inspiration
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <p className="mb-4">
            Remember: This app is designed to support your mental wellness journey. 
            For professional mental health care, please consult with a licensed therapist.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Made with care for your wellbeing</span>
          </div>
        </div>
      </div>
    </div>
  );
}