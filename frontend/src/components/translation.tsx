import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Languages, ArrowRightLeft, Volume2, Copy, CheckCircle } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

const mentalHealthPhrases = {
  en: [
    "I'm feeling anxious today",
    "I need someone to talk to",
    "I'm experiencing panic attacks",
    "I feel overwhelmed",
    "I'm having trouble sleeping",
    "I need professional help",
    "I'm feeling depressed",
    "I need emotional support"
  ],
  es: [
    "Me siento ansioso/a hoy",
    "Necesito hablar con alguien",
    "Estoy teniendo ataques de pánico",
    "Me siento abrumado/a",
    "Tengo problemas para dormir",
    "Necesito ayuda profesional",
    "Me siento deprimido/a",
    "Necesito apoyo emocional"
  ],
  fr: [
    "Je me sens anxieux/anxieuse aujourd'hui",
    "J'ai besoin de parler à quelqu'un",
    "J'ai des crises de panique",
    "Je me sens débordé(e)",
    "J'ai des problèmes de sommeil",
    "J'ai besoin d'aide professionnelle",
    "Je me sens déprimé(e)",
    "J'ai besoin de soutien émotionnel"
  ]
};

// Mock translation function - in a real app, this would call a translation API
const mockTranslate = (text: string, fromLang: string, toLang: string): string => {
  // Simple mock translations for demonstration
  const translations: { [key: string]: { [key: string]: string } } = {
    'en-es': {
      "I'm feeling anxious today": "Me siento ansioso/a hoy",
      "I need someone to talk to": "Necesito hablar con alguien",
      "I'm experiencing panic attacks": "Estoy teniendo ataques de pánico",
      "I feel overwhelmed": "Me siento abrumado/a",
      "I'm having trouble sleeping": "Tengo problemas para dormir",
      "I need professional help": "Necesito ayuda profesional",
      "I'm feeling depressed": "Me siento deprimido/a",
      "I need emotional support": "Necesito apoyo emocional",
      "Hello": "Hola",
      "How are you?": "¿Cómo estás?",
      "Thank you": "Gracias",
      "Please help me": "Por favor ayúdame"
    },
    'en-fr': {
      "I'm feeling anxious today": "Je me sens anxieux/anxieuse aujourd'hui",
      "I need someone to talk to": "J'ai besoin de parler à quelqu'un",
      "I'm experiencing panic attacks": "J'ai des crises de panique",
      "I feel overwhelmed": "Je me sens débordé(e)",
      "I'm having trouble sleeping": "J'ai des problèmes de sommeil",
      "I need professional help": "J'ai besoin d'aide professionnelle",
      "I'm feeling depressed": "Je me sens déprimé(e)",
      "I need emotional support": "J'ai besoin de soutien émotionnel",
      "Hello": "Bonjour",
      "How are you?": "Comment allez-vous?",
      "Thank you": "Merci",
      "Please help me": "Aidez-moi s'il vous plaît"
    }
  };

  const key = `${fromLang}-${toLang}`;
  const reverseKey = `${toLang}-${fromLang}`;
  
  // Try direct translation
  if (translations[key] && translations[key][text]) {
    return translations[key][text];
  }
  
  // Try reverse translation
  if (translations[reverseKey]) {
    const reverseTranslations = translations[reverseKey];
    for (const [target, source] of Object.entries(reverseTranslations)) {
      if (source === text) {
        return target;
      }
    }
  }
  
  // Fallback - return original text with a note
  return `[Translated: ${text}]`;
};

export function Translation() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = mockTranslate(sourceText, fromLanguage, toLanguage);
      setTranslatedText(result);
      setIsTranslating(false);
    }, 1000);
  };

  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
    
    // Swap texts if both exist
    if (sourceText && translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const copyToClipboard = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const playAudio = (text: string, lang: string) => {
    // In a real app, this would use a text-to-speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  const insertPhrase = (phrase: string) => {
    setSourceText(phrase);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <h2 className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5" />
          Translation Tool
        </h2>
        <p className="text-muted-foreground">
          Translate mental health phrases and communication to help break down language barriers 
          when seeking support or helping others.
        </p>
      </Card>

      {/* Language Selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block mb-2">From</label>
            <Select value={fromLanguage} onValueChange={setFromLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={swapLanguages}>
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div>
            <label className="block mb-2">To</label>
            <Select value={toLanguage} onValueChange={setToLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Source Text</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAudio(sourceText, fromLanguage)}
              disabled={!sourceText}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
          
          <Textarea
            placeholder="Enter text to translate..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-32 mb-4"
          />
          
          <Button 
            onClick={handleTranslate} 
            disabled={!sourceText.trim() || isTranslating}
            className="w-full"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </Card>

        {/* Translated Text */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Translation</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playAudio(translatedText, toLanguage)}
                disabled={!translatedText}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                disabled={!translatedText}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="min-h-32 p-3 border rounded-md bg-muted/50 mb-4">
            {translatedText || 'Translation will appear here...'}
          </div>
          
          {copied && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Copied to clipboard
            </p>
          )}
        </Card>
      </div>

      {/* Common Phrases */}
      <Card className="p-6">
        <h3 className="mb-4">Common Mental Health Phrases</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click on any phrase to automatically insert it for translation:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentalHealthPhrases[fromLanguage as keyof typeof mentalHealthPhrases]?.map((phrase, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3 whitespace-normal text-left"
              onClick={() => insertPhrase(phrase)}
            >
              {phrase}
            </Button>
          )) || (
            <p className="text-muted-foreground col-span-2">
              Common phrases not available for selected language. You can still translate any text manually.
            </p>
          )}
        </div>
      </Card>

      {/* Crisis Resources */}
      <Card className="p-6">
        <h3 className="mb-4">Emergency Phrases</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Important phrases for emergency situations:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 border rounded-lg">
            <strong>English:</strong> "I need immediate help"<br/>
            <strong>Spanish:</strong> "Necesito ayuda inmediata"<br/>
            <strong>French:</strong> "J'ai besoin d'aide immédiate"
          </div>
          <div className="p-3 border rounded-lg">
            <strong>English:</strong> "I'm having thoughts of self-harm"<br/>
            <strong>Spanish:</strong> "Tengo pensamientos de autolesión"<br/>
            <strong>French:</strong> "J'ai des pensées d'automutilation"
          </div>
          <div className="p-3 border rounded-lg">
            <strong>English:</strong> "Please call emergency services"<br/>
            <strong>Spanish:</strong> "Por favor llama a los servicios de emergencia"<br/>
            <strong>French:</strong> "Veuillez appeler les services d'urgence"
          </div>
          <div className="p-3 border rounded-lg">
            <strong>English:</strong> "Where is the nearest hospital?"<br/>
            <strong>Spanish:</strong> "¿Dónde está el hospital más cercano?"<br/>
            <strong>French:</strong> "Où est l'hôpital le plus proche?"
          </div>
        </div>

        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            🚨 <strong>Crisis Support:</strong> If you or someone you know is in immediate danger, 
            please contact local emergency services or a crisis hotline in your area immediately.
          </p>
        </div>
      </Card>
    </div>
  );
}