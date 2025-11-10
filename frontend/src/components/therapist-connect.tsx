import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  UserCheck, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Phone, 
  Video, 
  MessageCircle,
  Filter,
  Heart
} from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  price: string;
  availability: string;
  imageUrl: string;
  verified: boolean;
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  languages: string[];
  experience: number;
  approach: string;
}

const mockTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Licensed Clinical Psychologist',
    specialties: ['Anxiety', 'Depression', 'Trauma', 'CBT'],
    location: 'San Francisco, CA',
    rating: 4.9,
    reviewCount: 127,
    price: '$120-150',
    availability: 'Available this week',
    imageUrl: '/therapists/sarah-chen.jpg',
    verified: true,
    sessionTypes: ['in-person', 'video'],
    languages: ['English', 'Mandarin'],
    experience: 8,
    approach: 'Cognitive Behavioral Therapy, Mindfulness-based approaches'
  },
  {
    id: '2',
    name: 'Dr. Michael Rodriguez',
    title: 'Licensed Marriage & Family Therapist',
    specialties: ['Couples Therapy', 'Family Therapy', 'Communication'],
    location: 'Los Angeles, CA',
    rating: 4.8,
    reviewCount: 89,
    price: '$100-130',
    availability: 'Next available: Monday',
    imageUrl: '/therapists/michael-rodriguez.jpg',
    verified: true,
    sessionTypes: ['in-person', 'video', 'phone'],
    languages: ['English', 'Spanish'],
    experience: 12,
    approach: 'Gottman Method, Emotionally Focused Therapy'
  },
  {
    id: '3',
    name: 'Dr. Emily Johnson',
    title: 'Licensed Clinical Social Worker',
    specialties: ['PTSD', 'Addiction', 'Group Therapy'],
    location: 'New York, NY',
    rating: 4.7,
    reviewCount: 156,
    price: '$80-110',
    availability: 'Available this week',
    imageUrl: '/therapists/emily-johnson.jpg',
    verified: true,
    sessionTypes: ['video', 'phone'],
    languages: ['English'],
    experience: 15,
    approach: 'Trauma-informed care, EMDR, Dialectical Behavior Therapy'
  },
  {
    id: '4',
    name: 'Dr. David Kim',
    title: 'Psychiatrist',
    specialties: ['Medication Management', 'Bipolar Disorder', 'ADHD'],
    location: 'Seattle, WA',
    rating: 4.6,
    reviewCount: 73,
    price: '$200-250',
    availability: 'Next available: Wednesday',
    imageUrl: '/therapists/david-kim.jpg',
    verified: true,
    sessionTypes: ['in-person', 'video'],
    languages: ['English', 'Korean'],
    experience: 10,
    approach: 'Psychopharmacology, Integrative psychiatry'
  }
];

export function TherapistConnect() {
  const [therapists] = useState<Therapist[]>(mockTherapists);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  const allSpecialties = [...new Set(therapists.flatMap(t => t.specialties))];

  const filteredTherapists = therapists.filter(therapist => {
    if (searchLocation && !therapist.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }
    if (selectedSpecialty && !therapist.specialties.includes(selectedSpecialty)) {
      return false;
    }
    if (selectedSessionType && !therapist.sessionTypes.includes(selectedSessionType as any)) {
      return false;
    }
    return true;
  });

  const handleBooking = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    // In a real app, this would navigate to a booking system
  };

  if (selectedTherapist) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2>Book Appointment</h2>
            <Button variant="outline" onClick={() => setSelectedTherapist(null)}>
              Back to Search
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Therapist Info */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3>{selectedTherapist.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTherapist.title}</p>
                  {selectedTherapist.verified && (
                    <Badge className="mt-2">✓ Verified</Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedTherapist.rating} ({selectedTherapist.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedTherapist.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{selectedTherapist.price} per session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedTherapist.availability}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTherapist.specialties.map(specialty => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="mb-4">Request Appointment</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">First Name</label>
                      <Input placeholder="Your first name" />
                    </div>
                    <div>
                      <label className="block mb-2">Last Name</label>
                      <Input placeholder="Your last name" />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Email</label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>

                  <div>
                    <label className="block mb-2">Phone Number</label>
                    <Input type="tel" placeholder="(555) 123-4567" />
                  </div>

                  <div>
                    <label className="block mb-2">Preferred Session Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose session type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTherapist.sessionTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {type === 'video' && <Video className="w-4 h-4" />}
                              {type === 'phone' && <Phone className="w-4 h-4" />}
                              {type === 'in-person' && <UserCheck className="w-4 h-4" />}
                              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2">Preferred Time</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2">What would you like to work on? (Optional)</label>
                    <Textarea 
                      placeholder="Briefly describe what you'd like to focus on in therapy..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1">
                      Request Appointment
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
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
        <h2 className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5" />
          Find a Therapist
        </h2>
        <p className="text-muted-foreground">
          Connect with licensed mental health professionals who can provide personalized support and treatment.
        </p>
      </Card>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city, state, or zip code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block mb-2">Specialty</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any specialty</SelectItem>
                    {allSpecialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-2">Session Type</label>
                <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any session type</SelectItem>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="video">Video call</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-2">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any price range</SelectItem>
                    <SelectItem value="under-100">Under $100</SelectItem>
                    <SelectItem value="100-150">$100 - $150</SelectItem>
                    <SelectItem value="150-200">$150 - $200</SelectItem>
                    <SelectItem value="over-200">Over $200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Therapist Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTherapists.map(therapist => (
          <Card key={therapist.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3>{therapist.name}</h3>
                  {therapist.verified && (
                    <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{therapist.title}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{therapist.rating}</span>
                    <span className="text-muted-foreground">({therapist.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-muted-foreground">{therapist.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm mb-1">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {therapist.specialties.map(specialty => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  <span>{therapist.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span className="text-muted-foreground">{therapist.availability}</span>
                </div>
              </div>

              <div className="flex gap-1">
                {therapist.sessionTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type === 'video' && <Video className="w-3 h-3 mr-1" />}
                    {type === 'phone' && <Phone className="w-3 h-3 mr-1" />}
                    {type === 'in-person' && <UserCheck className="w-3 h-3 mr-1" />}
                    {type.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleBooking(therapist)} className="flex-1">
                Book Appointment
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTherapists.length === 0 && (
        <Card className="p-12 text-center">
          <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No therapists found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or location to find more results.
          </p>
        </Card>
      )}

      {/* Information */}
      <Card className="p-6">
        <h3 className="mb-4">Important Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="mb-2">What to Expect</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Initial consultation to assess your needs</li>
              <li>• Personalized treatment plan development</li>
              <li>• Regular sessions based on your schedule</li>
              <li>• Progress monitoring and adjustments</li>
              <li>• Confidential and professional care</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2">Insurance & Payment</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Many therapists accept insurance</li>
              <li>• Sliding scale fees may be available</li>
              <li>• HSA/FSA eligible expenses</li>
              <li>• Payment plans often available</li>
              <li>• Check with your insurance provider</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Note:</strong> This is a demonstration interface. In a real application, 
            therapist profiles would be verified and appointments would be managed through a secure booking system.
          </p>
        </div>
      </Card>
    </div>
  );
}