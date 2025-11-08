import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { motion } from 'motion/react';
import { 
  CloudRain, 
  Sun, 
  Moon, 
  Trees, 
  Waves, 
  Snowflake,
  Flame,
  Mountain,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
  Maximize
} from 'lucide-react';

interface Environment {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  primaryColor: string;
  secondaryColor: string;
  soundUrl?: string;
  particles: {
    type: 'rain' | 'snow' | 'leaves' | 'sparkles' | 'bubbles' | 'fireflies';
    count: number;
  };
}

const environments: Environment[] = [
  {
    id: 'rain',
    name: 'Rainy Day',
    description: 'Gentle rainfall with soft gray clouds',
    icon: <CloudRain className="w-6 h-6" />,
    primaryColor: '#64748b',
    secondaryColor: '#94a3b8',
    particles: { type: 'rain', count: 50 },
    soundUrl: "http://localhost:5000/sounds/rain_cloud.mp3",
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Warm sunset glow with floating particles',
    icon: <Sun className="w-6 h-6" />,
    primaryColor: '#f59e0b',
    secondaryColor: '#f97316',
    particles: { type: 'sparkles', count: 30 },
    soundUrl: "http://localhost:5000/sounds/sunset.mp3",
  },
  {
    id: 'night',
    name: 'Starry Night',
    description: 'Peaceful night with twinkling stars',
    icon: <Moon className="w-6 h-6" />,
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    particles: { type: 'fireflies', count: 25 },
    soundUrl: "http://localhost:5000/sounds/night.mp3",
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Mystical forest with floating leaves',
    icon: <Trees className="w-6 h-6" />,
    primaryColor: '#16a34a',
    secondaryColor: '#22c55e',
    particles: { type: 'leaves', count: 40 },
    soundUrl: "http://localhost:5000/sounds/forest_leaves.mp3",
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Underwater serenity with bubbles',
    icon: <Waves className="w-6 h-6" />,
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    particles: { type: 'bubbles', count: 35 },
    soundUrl: "http://localhost:5000/sounds/ocean_bubbles.mp3",
  },
  {
    id: 'winter',
    name: 'Winter Wonderland',
    description: 'Peaceful snowfall in a winter scene',
    icon: <Snowflake className="w-6 h-6" />,
    primaryColor: '#e0f2fe',
    secondaryColor: '#bae6fd',
    particles: { type: 'snow', count: 60 },
    soundUrl: "http://localhost:5000/sounds/winter.mp3",
  },
  {
    id: 'fireplace',
    name: 'Cozy Fireplace',
    description: 'Warm fireplace with dancing embers',
    icon: <Flame className="w-6 h-6" />,
    primaryColor: '#dc2626',
    secondaryColor: '#f97316',
    particles: { type: 'sparkles', count: 45 },
    soundUrl: "http://localhost:5000/sounds/warm_fireplace.mp3",
  },
  {
    id: 'mountain',
    name: 'Mountain Peak',
    description: 'Serene mountain vista with gentle breeze',
    icon: <Mountain className="w-6 h-6" />,
    primaryColor: '#7c3aed',
    secondaryColor: '#a855f7',
    particles: { type: 'sparkles', count: 20 },
    soundUrl: "http://localhost:5000/sounds/mountain.mp3",
  }
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function ImmersiveEnvironment() {
  const [selectedEnv, setSelectedEnv] = useState<Environment>(environments[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

    // Add sound handling
  const BASE_URL = "http://localhost:5000"; // adjust if your backend runs on another port
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // When environment changes, load and play the corresponding sound
    if (selectedEnv.soundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(selectedEnv.soundUrl);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume / 100;
      audioRef.current = audio;

      if (isPlaying) {
        audio.play().catch(err => console.error("Audio play error:", err));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedEnv]);

  useEffect(() => {
    // Handle play/pause toggle
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Audio play error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    // Update volume or mute
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);


  useEffect(() => {
    initializeParticles();
    if (isPlaying) {
      startAnimation();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedEnv, isPlaying]);

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < selectedEnv.particles.count; i++) {
      newParticles.push(createParticle(i, canvas.width, canvas.height));
    }
    setParticles(newParticles);
  };

  const createParticle = (id: number, width: number, height: number): Particle => {
    const { type } = selectedEnv.particles;
    
    let vx = 0, vy = 1, size = 2, color = selectedEnv.primaryColor;
    
    switch (type) {
      case 'rain':
        vx = Math.random() * 2 - 1;
        vy = Math.random() * 3 + 2;
        size = Math.random() * 2 + 1;
        color = '#60a5fa';
        break;
      case 'snow':
        vx = Math.random() * 1 - 0.5;
        vy = Math.random() * 1.5 + 0.5;
        size = Math.random() * 3 + 2;
        color = '#ffffff';
        break;
      case 'leaves':
        vx = Math.random() * 2 - 1;
        vy = Math.random() * 1 + 0.5;
        size = Math.random() * 4 + 3;
        color = ['#16a34a', '#22c55e', '#65a30d'][Math.floor(Math.random() * 3)];
        break;
      case 'sparkles':
        vx = Math.random() * 2 - 1;
        vy = Math.random() * 2 - 1;
        size = Math.random() * 3 + 1;
        color = '#fbbf24';
        break;
      case 'bubbles':
        vx = Math.random() * 1 - 0.5;
        vy = -Math.random() * 2 - 1;
        size = Math.random() * 6 + 3;
        color = '#67e8f9';
        break;
      case 'fireflies':
        vx = Math.random() * 2 - 1;
        vy = Math.random() * 2 - 1;
        size = Math.random() * 2 + 2;
        color = '#fde047';
        break;
    }

    return {
      id,
      x: Math.random() * width,
      y: type === 'bubbles' ? height + Math.random() * 100 : -Math.random() * 100,
      vx,
      vy,
      size,
      opacity: Math.random() * 0.7 + 0.3,
      color
    };
  };

  const updateParticles = (width: number, height: number) => {
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        let { x, y, vx, vy } = particle;
        
        x += vx;
        y += vy;

        // Reset particle when it goes off screen
        if (selectedEnv.particles.type === 'bubbles') {
          if (y < -10) {
            y = height + 10;
            x = Math.random() * width;
          }
        } else {
          if (y > height + 10) {
            y = -10;
            x = Math.random() * width;
          }
        }

        if (x < -10) x = width + 10;
        if (x > width + 10) x = -10;

        return { ...particle, x, y };
      })
    );
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      
      if (selectedEnv.particles.type === 'bubbles') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (selectedEnv.particles.type === 'rain') {
        ctx.fillRect(particle.x, particle.y, 1, particle.size * 2);
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  };

  const startAnimation = () => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      updateParticles(canvas.width, canvas.height);
      drawParticles();
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getGradientStyle = () => ({
    background: `linear-gradient(135deg, ${selectedEnv.primaryColor}20, ${selectedEnv.secondaryColor}40)`
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Environment Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" />
          <h2>Immersive Environments</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {environments.map((env) => (
            <Button
              key={env.id}
              variant={selectedEnv.id === env.id ? 'default' : 'outline'}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedEnv(env)}
            >
              {env.icon}
              <span className="text-sm">{env.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Environment Display */}
      <Card className="p-0 overflow-hidden">
        <div 
          className="relative"
          style={{
            height: isFullscreen ? '100vh' : '400px',
            ...getGradientStyle()
          }}
        >
          {/* Canvas for particles */}
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="absolute inset-0 w-full h-full"
          />

          {/* Environment overlay content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedEnv.id}
            >
              <motion.div
                className="mb-4 text-6xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {selectedEnv.icon}
              </motion.div>
              <h3 className="text-2xl mb-2 drop-shadow-lg">{selectedEnv.name}</h3>
              <p className="text-lg opacity-90 drop-shadow">{selectedEnv.description}</p>
            </motion.div>
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex items-center gap-2 text-white">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    onValueChange={(value: number[]) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-20"
                    disabled={isMuted}
                  />
                  <span className="text-sm w-8">{volume}%</span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={toggleFullscreen}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Environment Info */}
      <Card className="p-6">
        <h3 className="mb-4">About Immersive Environments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="mb-2">Benefits</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Reduces stress and anxiety</li>
              <li>• Improves focus and concentration</li>
              <li>• Promotes mindfulness</li>
              <li>• Creates calming atmosphere</li>
              <li>• Enhances meditation practice</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2">How to Use</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Choose your preferred environment</li>
              <li>• Press play to start the experience</li>
              <li>• Adjust volume to your liking</li>
              <li>• Use fullscreen for immersion</li>
              <li>• Combine with breathing exercises</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2">Best Practices</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Use headphones for better experience</li>
              <li>• Find a comfortable position</li>
              <li>• Focus on your breathing</li>
              <li>• Let thoughts come and go</li>
              <li>• Practice regularly for best results</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> These environments are designed to help you relax and find inner peace. 
            Take deep breaths and let yourself be present in the moment.
          </p>
        </div>
      </Card>
    </div>
  );
}