import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI wellness companion. I'm here to listen and support you. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const aiResponses = [
    "I understand how you're feeling. It's completely normal to have these emotions.",
    "Thank you for sharing that with me. Can you tell me more about what's been on your mind?",
    "It sounds like you're going through a challenging time. Remember that it's okay to feel this way.",
    "I'm here to support you. Have you tried any relaxation techniques that help you feel better?",
    "Your feelings are valid. Sometimes talking through things can really help. What's been the most difficult part?",
    "That sounds really tough. You're being very brave by reaching out and talking about this.",
    "I hear you. Sometimes taking things one day at a time can be helpful. What's one small thing that might make today better?",
    "Thank you for trusting me with your thoughts. Remember, you don't have to face this alone."
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // ... existing imports and state ...

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Temporarily append user message to display it immediately
    const messagesWithNewUser = [...messages, userMessage]; 
    setMessages(messagesWithNewUser); 
    setInputValue('');
    setIsTyping(true);

    try {
      // 1. **CHANGE URL**: Target the correct endpoint
      const response = await fetch("https://scaling-trust-ai.onrender.com/api/mental-support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messagesWithNewUser.map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }))
      })
    });

    const data = await response.json();

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.response ?? "I'm here with you. Could you tell me more?",
      sender: 'ai',
      timestamp: new Date(),
    };


      // Update state with the new AI message
      setMessages(prev => [...prev, aiMessage]); 
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

// ... rest of the component



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="w-6 h-6 text-blue-500" />
        <h2>AI Wellness Companion</h2>
      </div>

      <div className="h-96 mb-4">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>
            ))}
           {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}

          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Share your thoughts and feelings..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!inputValue.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> This AI companion is here to provide emotional support and a safe space to express your feelings. 
          For professional help, please consider speaking with a licensed therapist.
        </p>
      </div>
    </Card>
  );
}