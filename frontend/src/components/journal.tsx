import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import your Auth context

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'neutral';
  date: Date;
  tags: string[];
}

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  angry: '😠',
  neutral: '😐'
};

const moodColors = {
  happy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  anxious: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  calm: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  angry: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function Journal() {
  const { user } = useAuth(); // Get current logged in user
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
const [newEntry, setNewEntry] = useState<{
  title: string;
  content: string;
  mood: JournalEntry['mood']; // 👈 Use the interface type here
  tags: string;
}>({
  title: '',
  content: '',
  mood: 'neutral',
  tags: ''
});

const API_BASE = ''; // Proxy handles the base URL

// Inside your Journal component
useEffect(() => {
  if (user?.id) {
    fetch(`${API_BASE}/api/journal/${user.id}`)
      .then(res => res.json())
      .then(data => {
        // 🛡️ Safety check: Ensure data is an array
        const entriesArray = Array.isArray(data) ? data : [];
        
        setEntries(entriesArray.map((entry: any) => ({
          ...entry,
          date: new Date(entry.createdAt),
          // 🛡️ FIX: Convert the comma-separated String back to an Array
          tags: typeof entry.tags === 'string' 
            ? entry.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
            : []
        })));
      })
      .catch(err => console.error("Error loading journal:", err));
  }
}, [user]);

  // 2. Save or Update Entry in DB[cite: 2]
  const saveEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim() || !user?.id) return;

    const entryData = {
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: newEntry.tags, // Send as string, handle parsing on server or here
      userId: user.id
    };

    try {
      const url = editingEntry 
        ? `${API_BASE}/api/journal/update/${editingEntry.id}` 
        : `${API_BASE}/api/journal/save`;
      
      const response = await fetch(url, {
        method: editingEntry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        // Refresh local state[cite: 5]
        if (editingEntry) {
          setEntries(entries.map(e => e.id === editingEntry.id ? { ...savedEntry, date: new Date(savedEntry.createdAt) } : e));
        } else {
          setEntries([{ ...savedEntry, date: new Date(savedEntry.createdAt) }, ...entries]);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  // 3. Delete from DB[cite: 2]
  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/journal/delete/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEntries(entries.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const resetForm = () => {
    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '' });
    setIsWriting(false);
    setEditingEntry(null);
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', ')
    });
    setIsWriting(true);
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Writing Area */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h2>
            {!isWriting && (
              <Button onClick={() => setIsWriting(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            )}
          </div>

          {isWriting && (
            <div className="space-y-4">
              <Input
                placeholder="Entry title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Mood</label>
                  <select
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value as any })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <option key={mood} value={mood}>
                        {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Tags (comma separated)</label>
                  <Input
                    placeholder="gratitude, work, family..."
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                  />
                </div>
              </div>

              <Textarea
                placeholder="How are you feeling today? What's on your mind?"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="min-h-48"
              />

              <div className="flex gap-2">
                <Button onClick={saveEntry}>
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsWriting(false);
                    setEditingEntry(null);
                    setNewEntry({ title: '', content: '', mood: 'neutral', tags: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isWriting && entries.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Start Your Journey</h3>
              <p className="text-muted-foreground mb-4">
                Begin journaling to track your thoughts, feelings, and personal growth.
              </p>
              <Button onClick={() => setIsWriting(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Entry
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Journal Entries List */}
      <div>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="truncate">{entry.title}</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {entry.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={moodColors[entry.mood]}>
                      {moodEmojis[entry.mood]} {entry.mood}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.date.toLocaleDateString()}
                    </span>
                  </div>
                  
{Array.isArray(entry.tags) && entry.tags.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {entry.tags.map((tag, index) => (
      <Badge key={index} variant="outline" className="text-xs">
        {tag}
      </Badge>
    ))}
  </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}