import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Book, Search, Bookmark, Play, Eye, Star } from 'lucide-react';

interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  rating: number;
  chapters: Chapter[];
  coverImage: string;
  totalPages: number;
  currentPage: number;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  pageStart: number;
}

const sampleBooks: BookData[] = [
  {
    id: '1',
    title: 'The Anxiety and Worry Workbook',
    author: 'David A. Clark',
    description: 'A practical guide to overcoming anxiety and persistent worry with cognitive behavioral techniques.',
    category: 'Anxiety Management',
    rating: 4.5,
    coverImage: '/books/anxiety-workbook.jpg',
    totalPages: 280,
    currentPage: 0,
    chapters: [
      {
        id: '1-1',
        title: 'Understanding Anxiety',
        pageStart: 1,
        content: `Anxiety is a natural human emotion that serves an important purpose in our lives. It alerts us to potential threats and helps us prepare for challenges. However, when anxiety becomes excessive, persistent, or interferes with daily functioning, it may indicate an anxiety disorder.

Understanding the nature of anxiety is the first step toward managing it effectively. Anxiety involves three main components:

1. **Physical symptoms**: These include rapid heartbeat, sweating, trembling, shortness of breath, muscle tension, and digestive issues.

2. **Emotional symptoms**: Feelings of worry, fear, dread, irritability, and restlessness are common emotional manifestations of anxiety.

3. **Cognitive symptoms**: Racing thoughts, difficulty concentrating, catastrophic thinking, and persistent worry characterize the thinking patterns associated with anxiety.

It's important to recognize that anxiety exists on a spectrum. Mild anxiety can actually be helpful, motivating us to prepare for important events or alerting us to genuine dangers. However, when anxiety becomes overwhelming or disproportionate to the situation, it can significantly impact our quality of life.`
      },
      {
        id: '1-2',
        title: 'Cognitive Patterns in Anxiety',
        pageStart: 15,
        content: `Anxious thinking often follows predictable patterns that can intensify worry and fear. Learning to identify these patterns is crucial for developing effective coping strategies.

Common cognitive patterns in anxiety include:

**Catastrophizing**: This involves imagining the worst possible outcome in any situation. For example, thinking "If I make a mistake at work, I'll definitely get fired and never find another job."

**All-or-nothing thinking**: Seeing situations in black and white terms without recognizing middle ground. "Either I'm perfect or I'm a complete failure."

**Mind reading**: Assuming you know what others are thinking, usually expecting negative judgments. "Everyone thinks I'm incompetent."

**Fortune telling**: Predicting negative outcomes without evidence. "I know this presentation will go terribly."

**Magnification and minimization**: Exaggerating the importance of negative events while downplaying positive ones.

Understanding these patterns helps us recognize when our thoughts may be contributing to anxiety rather than reflecting reality.`
      }
    ]
  },
  {
    id: '2',
    title: 'Mindfulness for Beginners',
    author: 'Jon Kabat-Zinn',
    description: 'An introduction to mindfulness meditation and its benefits for mental health and wellbeing.',
    category: 'Mindfulness',
    rating: 4.7,
    coverImage: '/books/mindfulness.jpg',
    totalPages: 200,
    currentPage: 0,
    chapters: [
      {
        id: '2-1',
        title: 'What is Mindfulness?',
        pageStart: 1,
        content: `Mindfulness is the practice of paying attention to the present moment with openness, curiosity, and acceptance. It involves observing our thoughts, feelings, and sensations without getting caught up in them or trying to change them.

At its core, mindfulness is about awareness. It's about noticing what's happening in our minds and bodies right now, rather than being lost in thoughts about the past or future. This simple yet profound practice can have transformative effects on our mental health and overall wellbeing.

Key aspects of mindfulness include:

**Present-moment awareness**: Focusing attention on what's happening now rather than ruminating about the past or worrying about the future.

**Non-judgmental observation**: Noticing thoughts and feelings without labeling them as good or bad, right or wrong.

**Acceptance**: Allowing experiences to be as they are without immediately trying to change or fix them.

**Curiosity**: Approaching our inner experience with genuine interest and openness.

Regular mindfulness practice can help reduce anxiety, depression, and stress while improving focus, emotional regulation, and overall life satisfaction.`
      }
    ]
  },
  {
    id: '3',
    title: 'The Depression Cure',
    author: 'Stephen S. Ilardi',
    description: 'A comprehensive approach to overcoming depression through lifestyle changes and therapeutic techniques.',
    category: 'Depression Support',
    rating: 4.3,
    coverImage: '/books/depression-cure.jpg',
    totalPages: 320,
    currentPage: 0,
    chapters: [
      {
        id: '3-1',
        title: 'Understanding Depression',
        pageStart: 1,
        content: `Depression is more than just feeling sad or going through a rough patch. It's a serious mental health condition that affects how you feel, think, and handle daily activities. Understanding depression is the first step toward recovery.

Depression affects millions of people worldwide and can occur at any age. While the exact causes are complex and varied, research has identified several factors that contribute to depression:

**Biological factors**: Changes in brain chemistry, genetics, and hormonal fluctuations can all play a role in depression.

**Environmental factors**: Traumatic events, chronic stress, significant life changes, and social isolation can trigger or worsen depression.

**Psychological factors**: Negative thinking patterns, low self-esteem, and certain personality traits may increase vulnerability to depression.

The good news is that depression is highly treatable. With the right combination of professional help, lifestyle changes, and support, most people with depression can and do recover. Recovery is not only possible but expected with appropriate treatment.`
      }
    ]
  }
];

export function BookReader() {
  const [books] = useState<BookData[]>(sampleBooks);
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBookmark = (bookId: string) => {
    setBookmarks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const startReading = (book: BookData) => {
    setSelectedBook(book);
    setCurrentChapter(0);
  };

  if (selectedBook) {
    const chapter = selectedBook.chapters[currentChapter];
    
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2>{selectedBook.title}</h2>
              <p className="text-muted-foreground">by {selectedBook.author}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedBook(null)}>
              Back to Library
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chapter Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="mb-4">Chapters</h3>
                <div className="space-y-2">
                  {selectedBook.chapters.map((chap, index) => (
                    <Button
                      key={chap.id}
                      variant={index === currentChapter ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setCurrentChapter(index)}
                    >
                      <div>
                        <div className="text-sm">{chap.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Page {chap.pageStart}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Reading Area */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3>{chapter.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(selectedBook.id)}
                  >
                    <Bookmark 
                      className={`w-4 h-4 ${bookmarks.includes(selectedBook.id) ? 'fill-current' : ''}`} 
                    />
                  </Button>
                </div>

                <ScrollArea className="h-96 prose max-w-none">
                  <div className="whitespace-pre-line leading-relaxed">
                    {chapter.content}
                  </div>
                </ScrollArea>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                    disabled={currentChapter === 0}
                  >
                    Previous Chapter
                  </Button>
                  <Button
                    onClick={() => setCurrentChapter(Math.min(selectedBook.chapters.length - 1, currentChapter + 1))}
                    disabled={currentChapter === selectedBook.chapters.length - 1}
                  >
                    Next Chapter
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Mental Health Library
          </h2>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search books, authors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
        <p className="text-muted-foreground">
          Explore our curated collection of mental health and wellness books to support your journey.
        </p>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <Card key={book.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                <Book className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div>
                <h3 className="mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{book.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{book.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {book.description}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => startReading(book)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBookmark(book.id)}
                >
                  <Bookmark 
                    className={`w-4 h-4 ${bookmarks.includes(book.id) ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {book.totalPages} pages • {book.chapters.length} chapters
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Information */}
      <Card className="p-6">
        <h3 className="mb-4">About Our Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="mb-2">Evidence-Based Content</h4>
            <p className="text-muted-foreground">
              Our library features books written by licensed mental health professionals, 
              researchers, and experts in the field. All content is based on scientifically 
              validated approaches to mental health and wellness.
            </p>
          </div>
          <div>
            <h4 className="mb-2">Diverse Topics</h4>
            <p className="text-muted-foreground">
              From anxiety and depression management to mindfulness and stress reduction, 
              our collection covers a wide range of mental health topics to support 
              different needs and interests.
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Note:</strong> These resources are for educational purposes and complement 
            but do not replace professional mental health care.
          </p>
        </div>
      </Card>
    </div>
  );
}