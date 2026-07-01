import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Users,
  Calendar,
  MessageCircle,
  Activity,
  LogOut,
  Moon,
  Sun,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  User,
  Send,
  Video
} from 'lucide-react';
import { Input } from '../components/ui/input';

interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    todos: number;
    messages: number;
  };
  todos: Array<{
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
  }>;
  messages: Array<{
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
  }>;
}

interface CounselorStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalUsers: number;
}

interface Appointment {
  id: number;
  userId: number;
  userName: string;
  date: string;
  sessionType?: string;
  time: string;
  status: 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  type: string;
  videoLink?: 'https://whereby.com/digital-mental-health'; // 👈 FIX 1: Added videoLink to interface so TypeScript can parse safely
}

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const API_BASE = 'http://localhost:5000'; // Base API keeps its clean root matching your setups
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  async function parseJsonSafe(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      console.warn('Failed to parse JSON response:', text);
      return { error: text };
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes, appointmentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/counselor/users`),
        fetch(`${API_BASE}/api/counselor/stats/${user?.id}`),
        fetch(`${API_BASE}/api/counselor/appointments/${user?.id}`)
      ]);

      const usersData = usersRes.ok ? await parseJsonSafe(usersRes) : [];
      const statsData = statsRes.ok ? await parseJsonSafe(statsRes) : null;
      const appointmentsData = appointmentsRes.ok ? await parseJsonSafe(appointmentsRes) : [];

      setUsers(usersData);
      setStats(statsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch counselor data:', error);
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-20T00:00:00.000Z',
          _count: { todos: 5, messages: 23 },
          todos: [
            { id: 1, title: 'Practice breathing exercises', completed: true, createdAt: '2024-01-20T00:00:00.000Z' },
            { id: 2, title: 'Journal about feelings', completed: false, createdAt: '2024-01-19T00:00:00.000Z' }
          ],
          messages: [
            { id: 1, content: "I'm feeling anxious today", senderId: 1, createdAt: '2024-01-20T00:00:00.000Z' },
            { id: 2, content: "That's completely normal. Let's try some breathing exercises.", senderId: Number(user?.id) || 999, createdAt: '2024-01-20T00:00:00.000Z' }
          ]
        }
      ]);
      setStats({
        totalAppointments: 12,
        upcomingAppointments: 3,
        completedAppointments: 9,
        totalUsers: 8
      });
      setAppointments([
        { id: 1, userId: 1, userName: 'John Doe', date: '2024-05-20', time: '10:00 AM', status: 'UPCOMING', type: 'Video Call' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedUser || !replyMessage.trim() || !user?.id) return;

    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: Number(user.id),
          receiverId: selectedUser.id,
          content: replyMessage
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setSelectedUser({
          ...selectedUser,
          messages: [...selectedUser.messages, newMessage]
        });
        setReplyMessage('');
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const counselorStats = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Total Appointments', value: stats.totalAppointments.toString(), icon: Calendar, color: 'bg-green-500' },
    { label: 'Upcoming', value: stats.upcomingAppointments.toString(), icon: Clock, color: 'bg-purple-500' },
    { label: 'Completed', value: stats.completedAppointments.toString(), icon: CheckCircle, color: 'bg-orange-500' },
  ] : [
    { label: 'Total Users', value: '...', icon: Users, color: 'bg-blue-500' },
    { label: 'Total Appointments', value: '...', icon: Calendar, color: 'bg-green-500' },
    { label: 'Upcoming', value: '...', icon: Clock, color: 'bg-purple-500' },
    { label: 'Completed', value: '...', icon: CheckCircle, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-xl font-bold">Counselor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Mental Health Support Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="font-medium">{user?.name}</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Counselor</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {counselorStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">User Management</h3>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground">No users found.</p>
              ) : (
                <div className="space-y-4">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{u._count.todos} todos</p>
                          <p className="text-muted-foreground">{u._count.messages} messages</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Scheduled Appointments</h3>
                <Badge variant="outline" className="px-3 py-1">
                  {appointments.length} Upcoming Session{appointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No appointments found.</p>
                  <p className="text-xs text-muted-foreground">Sessions scheduled by users will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {appointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-base">{apt.userName}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" /> 
                              {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-500" /> 
                              {apt.time}
                            </span>
                            <span className="flex items-center gap-1.5 capitalize">
                              <Activity className="w-3.5 h-3.5 text-orange-500" /> 
                              {apt.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
<div className="flex items-center gap-3">
  <Badge 
    className={`
      ${apt.status === 'UPCOMING' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}
      ${apt.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-200' : ''}
      ${apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
      ${apt.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : ''}
      capitalize border
    `}
    variant="secondary"
  >
    {apt.status.toLowerCase()}
  </Badge>

{/* Updated Button layout container inside ConsoleDashboard.tsx */}
{(apt.status === 'UPCOMING' || apt.status === 'PENDING') && (
  <Button 
    size="sm" 
    // Removed contrasting style overrides to let Tailwind render a solid blue background
    className="bg-blue-600 hover:bg-blue-700 text-zinc-50 dark:text-zinc-900 shadow-sm flex items-center gap-1"
    onClick={async () => {
      const testLink = "https://whereby.com/digital-mental-health"; 
      window.open(testLink, '_blank');
    }}
  >
    <Video className="w-4 h-4 text-zinc-50" />
    <span className="text-zinc-50">Start Session</span>
  </Button>
)}
</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">Activity monitoring coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                      <p className="text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Mental Health Activity</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Messages</p>
                        <p className="text-2xl font-bold">{selectedUser._count.messages}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Completed Todos</p>
                        <p className="text-2xl font-bold">{selectedUser._count.todos}</p>
                      </div>
                    </div>

                    <h4 className="text-md font-semibold mt-6 mb-3">Recent Todos</h4>
                    <div className="space-y-2">
                      {selectedUser.todos.slice(0, 5).map((todo) => (
                        <div key={todo.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <CheckCircle className={`w-4 h-4 ${todo.completed ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                            {todo.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Chat History</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedUser.messages?.map((message) => {
                        const isMe = message.senderId === Number(user?.id);
                        return (
                          <div key={message.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`p-3 rounded-lg max-w-[80%] ${isMe ? 'bg-green-100 text-right' : 'bg-blue-100 text-left'}`}>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold opacity-70">
                                  {isMe ? 'You' : selectedUser.name}
                                </span>
                                <p className="text-sm">{message.content}</p>
                                <span className="text-[10px] opacity-50">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Type your reply to the user..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                      />
                      <Button onClick={sendReply}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}