import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
  isPlaying: boolean;
  volume: number;
}

export function CalmingSounds() {
  const BASE_URL = "http://localhost:5000";
  const [sounds, setSounds] = useState<Sound[]>([
    { id: 'rain', name: 'Rain', icon: '🌧️', description: 'Gentle rainfall sounds', url: `${BASE_URL}/sounds/rain.mp3`, isPlaying: false, volume: 50 },
    { id: 'ocean', name: 'Ocean Waves', icon: '🌊', description: 'Peaceful ocean waves', url: `${BASE_URL}/sounds/ocean.mp3`, isPlaying: false, volume: 50 },
    { id: 'forest', name: 'Forest', icon: '🌲', description: 'Birds and nature sounds', url: `${BASE_URL}/sounds/forest.mp3`, isPlaying: false, volume: 50 },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥', description: 'Crackling fireplace', url: `${BASE_URL}/sounds/fireplace.mp3`, isPlaying: false, volume: 50 },
    { id: 'whitenoise', name: 'White Noise', icon: '📻', description: 'Consistent white noise', url: `${BASE_URL}/sounds/whitenoise.mp3`, isPlaying: false, volume: 50 },
    { id: 'cafe', name: 'Coffee Shop', icon: '☕', description: 'Ambient cafe sounds', url: `${BASE_URL}/sounds/cafe.mp3`, isPlaying: false, volume: 50 },
  ]);

  const [masterVolume, setMasterVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    sounds.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = (sound.volume / 100) * (masterVolume / 100);
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  useEffect(() => {
    Object.entries(audioRefs.current).forEach(([soundId, audio]) => {
      const sound = sounds.find((s) => s.id === soundId);
      if (sound) {
        audio.volume = isMuted ? 0 : (sound.volume / 100) * (masterVolume / 100);
      }
    });
  }, [sounds, masterVolume, isMuted]);

  const toggleSound = (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (!audio) return;

    setSounds((prevSounds) =>
      prevSounds.map((sound) => {
        if (sound.id === soundId) {
          const newPlaying = !sound.isPlaying;
          if (newPlaying) audio.play().catch((err) => console.error(`Error playing ${sound.name}:`, err));
          else audio.pause();
          return { ...sound, isPlaying: newPlaying };
        }
        return sound;
      })
    );
  };

  const updateSoundVolume = (soundId: string, volume: number) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) =>
        sound.id === soundId ? { ...sound, volume } : sound
      )
    );
  };

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach((audio) => audio.pause());
    setSounds((prevSounds) =>
      prevSounds.map((sound) => ({ ...sound, isPlaying: false }))
    );
  };

  const playingCount = sounds.filter((s) => s.isPlaying).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">Calming Sounds</h1>
        <p className="text-muted-foreground mb-6">
          {playingCount} sound{playingCount !== 1 ? 's' : ''} playing
        </p>

        {playingCount > 0 && (
          <Button variant="outline" onClick={stopAllSounds}>
           Stop All
          </Button>
        )}

        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm w-20">Master Volume</span>
              <Slider
                value={[masterVolume]}
                onValueChange={(value: number[]) => setMasterVolume(value[0])}
                max={100}
                step={1}
                className="flex-1"
                disabled={isMuted}
              />
              <span className="text-sm w-12 text-right">{masterVolume}%</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sounds.map((sound) => (
          <Card key={sound.id} className="p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{sound.icon}</div>
              <h3 className="mb-1">{sound.name}</h3>
              <p className="text-sm text-muted-foreground">{sound.description}</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => toggleSound(sound.id)}
                className={`w-full ${sound.isPlaying ? 'bg-green-500 hover:bg-green-600' : ''}`}
                variant={sound.isPlaying ? 'default' : 'outline'}
              >
                {sound.isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Playing
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volume</span>
                  <span className="text-sm text-muted-foreground">{sound.volume}%</span>
                </div>
                <Slider
                  value={[sound.volume]}
                  onValueChange={(value: number[]) =>
                    updateSoundVolume(sound.id, value[0])
                  }
                  max={100}
                  step={1}
                  disabled={!sound.isPlaying || isMuted}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
