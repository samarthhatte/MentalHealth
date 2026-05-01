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
  Settings, 
  BarChart3, 
  MessageSquare, 
  BookOpen,
  Activity,
  LogOut,
  Moon,
  Sun,
  Shield,
  Database,
  Bell,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  totalTodos: number;
  activeToday: number;
  newUsersThisWeek: number;
  messagesThisWeek: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    todos: number;
    chatMessages: number;
  };
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

interface SystemHealth {
  status: string;
  uptime: string;
  database: string;
  api: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [counselors, setCounselors] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

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
      const [statsRes, usersRes, counselorsRes, activityRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/users`),
        fetch(`${API_BASE}/api/counselors`),
        fetch(`${API_BASE}/api/admin/activity`),
        fetch(`${API_BASE}/api/admin/health`)
      ]);

      const statsData = statsRes.ok ? await parseJsonSafe(statsRes) : null;
      const usersData = usersRes.ok ? await parseJsonSafe(usersRes) : [];
      const counselorsData = counselorsRes.ok ? await parseJsonSafe(counselorsRes) : [];
      const activityData = activityRes.ok ? await parseJsonSafe(activityRes) : [];
      const healthData = healthRes.ok ? await parseJsonSafe(healthRes) : null;

      setStats(statsData);
      setUsers(usersData);
      setCounselors(counselorsData);
      setActivities(activityData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const adminStats = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Active Today', value: stats.activeToday.toString(), icon: Activity, color: 'bg-green-500' },
    { label: 'Total Messages', value: stats.totalMessages.toString(), icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'New This Week', value: stats.newUsersThisWeek.toString(), icon: Users, color: 'bg-orange-500' },
  ] : [
    { label: 'Total Users', value: '...', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Today', value: '...', icon: Activity, color: 'bg-green-500' },
    { label: 'Total Messages', value: '...', icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'New This Week', value: '...', icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">MindfulSpace Admin Panel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="font-medium">{user?.name}</span>
              <Badge variant="destructive" className="ml-2">Admin</Badge>
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
          {adminStats.map((stat, index) => (
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span>Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="w-5 h-5" />
                    <span>System Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="w-5 h-5" />
                    <span>Backup Data</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : health ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Server Status</span>
                      <Badge variant="default" className="bg-green-500">{health.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uptime</span>
                      <span className="text-sm text-muted-foreground">{health.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge variant="default" className="bg-green-500">{health.database}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Status</span>
                      <Badge variant="default" className="bg-green-500">{health.api}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Unable to load system status</p>
                )}
              </Card>
            </div>
          </TabsContent>

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
                          <Badge variant="secondary" className="mt-2 inline-block">
                            {u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'User'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{u._count.todos} todos</p>
                          <p className="text-muted-foreground">{u._count.chatMessages} messages</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="counselors">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Counselors</h3>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : counselors.length === 0 ? (
                <p className="text-muted-foreground">No counselors found.</p>
              ) : (
                <div className="space-y-4">
                  {counselors.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-sm text-muted-foreground">{c.email}</p>
                          <p className="text-xs text-muted-foreground">Joined: {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">Counselor</Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Activity Log</h3>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">by {log.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatTime(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Site Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Site Name</p>
                      <p className="font-medium">MindfulSpace</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Admin Email</p>
                      <p className="font-medium">admin@test.com</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Security</h4>
                  <Button variant="outline">Change Admin Password</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}