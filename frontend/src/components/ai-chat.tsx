import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 1. Load chat history from SQLite on mount
// 1. Load chat history from SQLite on mount
useEffect(() => {
  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/chat/history/${user.id}`);
      const history = await response.json();
      
      if (Array.isArray(history)) {
        const formatted = history.map((m: any) => ({
          id: m.id.toString(),
          content: m.message,
          sender: (m.role === 'assistant' ? 'ai' : 'user') as 'user' | 'ai',
          timestamp: new Date(m.createdAt)
        }));

        // ✅ CRITICAL: You must call setMessages here!
        if (formatted.length > 0) {
          setMessages(formatted);
        } else {
          // Default welcome message if no history exists
          setMessages([{
            id: 'welcome',
            content: "Hello! I'm your AI wellness companion. How are you feeling today?",
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      }
    } catch (err) {
      console.error("Load history failed:", err);
    }
  };
  loadHistory();
}, [user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. Helper to save to local SQLite database
  const saveToDb = async (content: string, role: string) => {
    if (!user?.id) return;
    try {
      await fetch("http://localhost:5000/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          role: role, // "user" or "assistant"
          userId: user.id
        }),
      });
    } catch (err) {
      console.error("DB Save failed:", err);
    }
  };

  // 3. Unified Send Message Logic
  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userContent = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userContent,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Save user message to SQLite
    await saveToDb(userContent, 'user');

    try {
      // Get response from External AI
      const response = await fetch("https://scaling-trust-ai.onrender.com/api/mental-support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent }),
      });

      const data = await response.json();
      
      // Handle various AI response formats
      const aiMsgText = data?.message || data?.response || data?.reply || "I'm here for you. Tell me more.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiMsgText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI response to SQLite
      await saveToDb(aiMsgText, 'assistant');

    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold">AI Wellness Companion</h2>
      </div>

      <div className="h-96 mb-4">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <p className="break-words">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
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
          placeholder="Share your thoughts..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!inputValue.trim() || isTyping}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}