import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  UserCheck, 
  Calendar, 
  Phone, 
  Video, 
  MessageCircle,
  Send,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Counselor {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  sessionType: string;
  notes?: string;
  videoLink?: 'https://whereby.com/digital-mental-health'; // 👈 Added videoLink field
  counselor: {
    name: string;
    email: string;
  };
}

interface Message {
  id: number;
  content: string;
  senderId: number; 
  createdAt: string;
  isRead: boolean;
  sender: {
    name: string;
  };
  receiver: {
    name: string;
  };
}

const API_BASE = 'http://localhost:5000/api';

export function TherapistConnect() {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'counselors' | 'appointments' | 'messages'>('counselors');

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    sessionType: 'video',
    notes: ''
  });

  useEffect(() => {
    fetchCounselors();
    if (user) {
      fetchUserAppointments();
      initializeSocket();
    }
  }, [user]);

  const initializeSocket = () => {
    if (!user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', user.id);

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => {
        const isDuplicate = prev.some(m => m.id === message.id);
        if (isDuplicate) return prev;
        return [...prev, message];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  };

  const fetchCounselors = async () => {
    try {
      const response = await fetch(`${API_BASE}/counselors`);
      if (response.ok) {
        const data = await response.json();
        setCounselors(data);
      }
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAppointments = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/appointments/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchMessages = async (counselorId: number) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/messages/${user.id}/${counselorId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleBooking = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setActiveTab('counselors');
  };

  const submitBooking = async () => {
    if (!user || !selectedCounselor) return;

    try {
      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          counselorId: selectedCounselor.id,
          ...bookingForm
        })
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        setSelectedCounselor(null);
        setBookingForm({ date: '', time: '', sessionType: 'video', notes: '' });
        fetchUserAppointments();
      } else {
        alert('Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book appointment');
    }
  };

  const handleMessage = async (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    await fetchMessages(counselor.id);
    setActiveTab('messages');
  };

  const sendMessage = async () => {
    if (!user || !selectedCounselor || !newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedCounselor.id,
          content: newMessage
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (selectedCounselor && activeTab === 'counselors') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2>Book Appointment with {selectedCounselor.name}</h2>
            <Button variant="outline" onClick={() => setSelectedCounselor(null)}>
              Back to Counselors
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3>{selectedCounselor.name}</h3>
                  <p className="text-sm text-muted-foreground">Licensed Counselor</p>
                  <Badge className="mt-2">✓ Verified</Badge>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2">Available Session Types</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      <Video className="w-3 h-3 mr-1" />
                      Video Call
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Phone Call
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="mb-4">Request Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Preferred Date</label>
                    <Input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Preferred Time</label>
                    <Select value={bookingForm.time} onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00 AM">9:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="02:00 PM">2:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">3:00 PM</SelectItem>
                        <SelectItem value="04:00 PM">4:00 PM</SelectItem>
                        <SelectItem value="05:00 PM">5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2">Session Type</label>
                    <Select value={bookingForm.sessionType} onValueChange={(value) => setBookingForm(prev => ({ ...prev, sessionType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2">What would you like to work on? (Optional)</label>
                    <Textarea 
                      placeholder="Briefly describe what you'd like to focus on in therapy..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-24"
                    />
                  </div>

                  <Button onClick={submitBooking} className="w-full">
                    Request Appointment
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (activeTab === 'messages' && selectedCounselor) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2>Chat with {selectedCounselor.name}</h2>
            <Button variant="outline" onClick={() => { setSelectedCounselor(null); setActiveTab('counselors'); }}>
              Back to Counselors
            </Button>
          </div>

          <div className="h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg flex flex-col gap-3">
              {messages.map((message) => {
                const isMe = Number(message.senderId) === Number(user?.id);
                return (
                  <div key={message.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`text-[10px] mt-1 opacity-70 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
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
        <h2 className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5" />
          Therapist Connect
        </h2>
        <p className="text-muted-foreground">
          Connect with licensed counselors for personalized mental health support.
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button 
          variant={activeTab === 'counselors' ? 'default' : 'outline'}
          onClick={() => setActiveTab('counselors')}
        >
          Find Counselors
        </Button>
        <Button 
          variant={activeTab === 'appointments' ? 'default' : 'outline'}
          onClick={() => setActiveTab('appointments')}
        >
          My Appointments ({appointments.length})
        </Button>
      </div>

      {activeTab === 'counselors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3>{counselor.name}</h3>
                    <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Licensed Counselor</p>
                  <div className="text-sm">
                    <p>Experience: {Math.floor((Date.now() - new Date(counselor.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} years</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleBooking(counselor)} className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" onClick={() => handleMessage(counselor)}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No appointments yet</h3>
              <p className="text-muted-foreground">
                Book your first appointment with a counselor to get started.
              </p>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{appointment.counselor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.date)} at {appointment.time}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 inline text-zinc-400" />
                        <span className="capitalize">{appointment.sessionType} session</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
    {appointment.status}
  </Badge>
  
  {/* 🔍 TESTING OVERRIDE: Allow the button to show if status is confirmed OR pending */}
  {(appointment.status === 'confirmed' || appointment.status.toLowerCase() === 'pending') && appointment.sessionType === 'video' && (
    <Button 
      size="sm" 
      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 shadow-sm"
      onClick={() => {
        // 🔍 TESTING OVERRIDE: Use your hardcoded test room link directly
        const testLink = "https://whereby.com/digital-mental-health"; // 👈 Use your exact Daily.co link!
        window.open(testLink, '_blank');
      }}
    >
      <Video className="w-3.5 h-3.5" />
      Join Video Call
    </Button>
  )}
</div>
                </div>
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Information Footer */}
      <Card className="p-6">
        <h3 className="mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="mb-2">Find a Counselor</h4>
            <p className="text-muted-foreground">
              Browse verified counselors and read their profiles to find the right match for your needs.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="mb-2">Book Appointment</h4>
            <p className="text-muted-foreground">
              Schedule a convenient time for your session through video call or phone.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="mb-2">Connect & Communicate</h4>
            <p className="text-muted-foreground">
              Message your counselor anytime and attend sessions for ongoing support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}