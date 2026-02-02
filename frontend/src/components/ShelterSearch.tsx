import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Users, 
  Bed, 
  Clock, 
  Shield, 
  Heart, 
  Car,
  Wifi,
  Utensils,
  Shower,
  Package,
  Search,
  Filter,
  Star,
  AlertTriangle,
  Info,
  Navigation,
  RefreshCw
} from 'lucide-react';

interface ShelterSearchCriteria {
  lat?: number;
  lng?: number;
  maxDistance: number;
  populationType?: 'men' | 'women' | 'families' | 'youth' | 'mixed';
  hasAvailableBeds: boolean;
  acceptsPets: boolean;
  wheelchairAccessible: boolean;
  emergencyOnly?: boolean;
  requiresIntake?: boolean;
  hasSpecialServices: string[];
  limit: number;
}

interface Shelter {
  id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone?: string;
    website?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  serves: {
    adultMen: boolean;
    adultWomen: boolean;
    families: boolean;
    youth: boolean;
  };
  capacity: {
    men?: number;
    women?: number;
    families?: number;
    youth?: number;
    total: number;
  };
  availability: {
    men?: number;
    women?: number;
    families?: number;
    youth?: number;
    total?: number;
    lastUpdated?: string;
  };
  policies: {
    maxStayDays?: number;
    allowsPets: boolean;
    wheelchairAccessible: boolean;
    requiresIntake: boolean;
    emergencyOnly: boolean;
  };
  services: {
    meals: boolean;
    showers: boolean;
    laundry: boolean;
    storage: boolean;
    transportation: boolean;
    phoneAccess: boolean;
    internetAccess: boolean;
    medical: boolean;
    mentalHealth: boolean;
    substanceAbuse: boolean;
    jobTraining: boolean;
    childcare: boolean;
    education: boolean;
    caseManagement: boolean;
    legalAid: boolean;
    security: boolean;
  };
  ranking: {
    score: number;
    distance?: number;
    availabilityMatch: boolean;
    serviceMatches: string[];
    accessibilityMatch: boolean;
    reasoning: string[];
    warnings: string[];
  };
}

interface SearchSummary {
  totalFound: number;
  withAvailability: number;
  averageDistance?: number;
  topServices: string[];
}

const SERVICE_OPTIONS = [
  { id: 'medical', label: 'Medical Care', icon: Heart },
  { id: 'mental_health', label: 'Mental Health Support', icon: Heart },
  { id: 'substance_abuse', label: 'Substance Abuse Support', icon: Heart },
  { id: 'job_training', label: 'Job Training', icon: Users },
  { id: 'childcare', label: 'Childcare', icon: Users },
  { id: 'educational_support', label: 'Educational Support', icon: Users },
  { id: 'case_management', label: 'Case Management', icon: Users },
  { id: 'legal_aid', label: 'Legal Aid', icon: Shield },
  { id: 'transportation', label: 'Transportation', icon: Car }
];

export default function ShelterSearch() {
  const [searchCriteria, setSearchCriteria] = useState<ShelterSearchCriteria>({
    maxDistance: 10,
    hasAvailableBeds: true,
    acceptsPets: false,
    wheelchairAccessible: false,
    hasSpecialServices: [],
    limit: 10
  });

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  // Get user's location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setSearchCriteria(prev => ({ ...prev, ...location }));
          setLocationError('');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Unable to get your location. Search results will not include distance sorting.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const updateSearchCriteria = (field: keyof ShelterSearchCriteria, value: any) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSpecialService = (serviceId: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      hasSpecialServices: prev.hasSpecialServices.includes(serviceId)
        ? prev.hasSpecialServices.filter(id => id !== serviceId)
        : [...prev.hasSpecialServices, serviceId]
    }));
  };

  const searchShelters = async () => {
    setLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchCriteria.lat) params.append('lat', searchCriteria.lat.toString());
      if (searchCriteria.lng) params.append('lng', searchCriteria.lng.toString());
      params.append('maxDistance', searchCriteria.maxDistance.toString());
      if (searchCriteria.populationType) params.append('populationType', searchCriteria.populationType);
      params.append('hasAvailableBeds', searchCriteria.hasAvailableBeds.toString());
      params.append('acceptsPets', searchCriteria.acceptsPets.toString());
      params.append('wheelchairAccessible', searchCriteria.wheelchairAccessible.toString());
      if (searchCriteria.emergencyOnly !== undefined) params.append('emergencyOnly', searchCriteria.emergencyOnly.toString());
      if (searchCriteria.requiresIntake !== undefined) params.append('requiresIntake', searchCriteria.requiresIntake.toString());
      searchCriteria.hasSpecialServices.forEach(service => params.append('hasSpecialServices', service));
      params.append('limit', searchCriteria.limit.toString());

      const response = await fetch(`/api/shelters/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setShelters(data.shelters);
        setSummary(data.summary);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when criteria change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchCriteria.lat && searchCriteria.lng) {
        searchShelters();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchCriteria]);

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Distance unknown';
    return `${distance.toFixed(1)} miles`;
  };

  const formatLastUpdated = (lastUpdated?: string) => {
    if (!lastUpdated) return 'No recent updates';
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Updated recently';
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays} days ago`;
  };

  const getAvailabilityStatus = (shelter: Shelter) => {
    const { availability, ranking } = shelter;
    
    if (!ranking.availabilityMatch) {
      return { status: 'none', text: 'No beds available', color: 'text-red-600' };
    }
    
    const total = availability.total || 0;
    if (total >= 10) {
      return { status: 'high', text: `${total} beds available`, color: 'text-green-600' };
    } else if (total >= 3) {
      return { status: 'medium', text: `${total} beds available`, color: 'text-yellow-600' };
    } else if (total > 0) {
      return { status: 'low', text: `${total} beds available`, color: 'text-orange-600' };
    }
    
    return { status: 'none', text: 'No beds available', color: 'text-red-600' };
  };

  const renderShelterCard = (shelter: Shelter) => {
    const availabilityStatus = getAvailabilityStatus(shelter);
    
    return (
      <Card 
        key={shelter.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedShelter(shelter)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{shelter.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{shelter.address.city}, {shelter.address.state}</span>
                  {shelter.ranking.distance && (
                    <>
                      <span>•</span>
                      <span>{formatDistance(shelter.ranking.distance)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{shelter.ranking.score}</span>
                </div>
                <div className={`text-sm font-medium ${availabilityStatus.color}`}>
                  {availabilityStatus.text}
                </div>
              </div>
            </div>

            {/* Description */}
            {shelter.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{shelter.description}</p>
            )}

            {/* Services and Population */}
            <div className="flex flex-wrap gap-2">
              {/* Population served */}
              {shelter.serves.adultMen && <Badge variant="outline">Men</Badge>}
              {shelter.serves.adultWomen && <Badge variant="outline">Women</Badge>}
              {shelter.serves.families && <Badge variant="outline">Families</Badge>}
              {shelter.serves.youth && <Badge variant="outline">Youth</Badge>}
              
              {/* Key services */}
              {shelter.services.meals && <Badge variant="secondary">Meals</Badge>}
              {shelter.services.medical && <Badge variant="secondary">Medical</Badge>}
              {shelter.policies.allowsPets && <Badge variant="secondary">Pet-Friendly</Badge>}
              {shelter.policies.wheelchairAccessible && <Badge variant="secondary">Accessible</Badge>}
              
              {/* Service matches */}
              {shelter.ranking.serviceMatches.slice(0, 2).map(service => (
                <Badge key={service} className="bg-green-100 text-green-700">
                  ✓ {service.replace('_', ' ')}
                </Badge>
              ))}
            </div>

            {/* Warnings */}
            {shelter.ranking.warnings.length > 0 && (
              <Alert className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {shelter.ranking.warnings[0]}
                  {shelter.ranking.warnings.length > 1 && ` (+${shelter.ranking.warnings.length - 1} more)`}
                </AlertDescription>
              </Alert>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                {shelter.contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{shelter.contact.phone}</span>
                  </div>
                )}
                {shelter.contact.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </div>
                )}
              </div>
              <div className="text-xs">
                {formatLastUpdated(shelter.availability.lastUpdated)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderShelterDetails = () => {
    if (!selectedShelter) return null;

    const shelter = selectedShelter;
    
    return (
      <Dialog open={!!selectedShelter} onOpenChange={() => setSelectedShelter(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{shelter.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                      <div>
                        <div>{shelter.address.street}</div>
                        <div>{shelter.address.city}, {shelter.address.state} {shelter.address.zipCode}</div>
                      </div>
                    </div>
                    
                    {shelter.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${shelter.contact.phone}`} className="text-blue-600 hover:underline">
                          {shelter.contact.phone}
                        </a>
                      </div>
                    )}
                    
                    {shelter.contact.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a 
                          href={shelter.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    {shelter.ranking.distance && (
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-gray-500" />
                        <span>{formatDistance(shelter.ranking.distance)} away</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Match Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">{shelter.ranking.score}</div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Why this shelter matches:</h4>
                      <ul className="text-sm space-y-1">
                        {shelter.ranking.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {shelter.ranking.warnings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-orange-700">Considerations:</h4>
                        <ul className="text-sm space-y-1">
                          {shelter.ranking.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {shelter.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About This Shelter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{shelter.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Availability</CardTitle>
                  <p className="text-sm text-gray-600">
                    {formatLastUpdated(shelter.availability.lastUpdated)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {shelter.serves.adultMen && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {shelter.availability.men ?? '?'}
                        </div>
                        <div className="text-sm text-gray-600">Men</div>
                        <div className="text-xs text-gray-500">
                          / {shelter.capacity.men} capacity
                        </div>
                      </div>
                    )}
                    
                    {shelter.serves.adultWomen && (
                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">
                          {shelter.availability.women ?? '?'}
                        </div>
                        <div className="text-sm text-gray-600">Women</div>
                        <div className="text-xs text-gray-500">
                          / {shelter.capacity.women} capacity
                        </div>
                      </div>
                    )}
                    
                    {shelter.serves.families && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {shelter.availability.families ?? '?'}
                        </div>
                        <div className="text-sm text-gray-600">Families</div>
                        <div className="text-xs text-gray-500">
                          / {shelter.capacity.families} capacity
                        </div>
                      </div>
                    )}
                    
                    {shelter.serves.youth && (
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {shelter.availability.youth ?? '?'}
                        </div>
                        <div className="text-sm text-gray-600">Youth</div>
                        <div className="text-xs text-gray-500">
                          / {shelter.capacity.youth} capacity
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {shelter.availability.total !== undefined && (
                    <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-700">
                        {shelter.availability.total}
                      </div>
                      <div className="text-gray-600">Total Available Beds</div>
                      <div className="text-sm text-gray-500">
                        / {shelter.capacity.total} total capacity
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Basic Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 ${shelter.services.meals ? 'text-green-600' : 'text-gray-400'}`}>
                        <Utensils className="h-4 w-4" />
                        <span>Meals</span>
                      </div>
                      <div className={`flex items-center gap-2 ${shelter.services.showers ? 'text-green-600' : 'text-gray-400'}`}>
                        <Shower className="h-4 w-4" />
                        <span>Showers</span>
                      </div>
                      <div className={`flex items-center gap-2 ${shelter.services.laundry ? 'text-green-600' : 'text-gray-400'}`}>
                        <Package className="h-4 w-4" />
                        <span>Laundry</span>
                      </div>
                      <div className={`flex items-center gap-2 ${shelter.services.storage ? 'text-green-600' : 'text-gray-400'}`}>
                        <Package className="h-4 w-4" />
                        <span>Storage</span>
                      </div>
                      <div className={`flex items-center gap-2 ${shelter.services.internetAccess ? 'text-green-600' : 'text-gray-400'}`}>
                        <Wifi className="h-4 w-4" />
                        <span>Internet</span>
                      </div>
                      <div className={`flex items-center gap-2 ${shelter.services.phoneAccess ? 'text-green-600' : 'text-gray-400'}`}>
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Support Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { key: 'medical', label: 'Medical Care' },
                        { key: 'mentalHealth', label: 'Mental Health Support' },
                        { key: 'substanceAbuse', label: 'Substance Abuse Support' },
                        { key: 'jobTraining', label: 'Job Training' },
                        { key: 'education', label: 'Educational Support' },
                        { key: 'caseManagement', label: 'Case Management' },
                        { key: 'legalAid', label: 'Legal Aid' },
                        { key: 'childcare', label: 'Childcare' },
                        { key: 'transportation', label: 'Transportation' }
                      ].map(service => (
                        <div 
                          key={service.key}
                          className={`flex items-center gap-2 ${
                            shelter.services[service.key as keyof typeof shelter.services] 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            shelter.services[service.key as keyof typeof shelter.services]
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                          }`} />
                          <span>{service.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="policies" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admission Policies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Requires Intake Process</span>
                      <Badge variant={shelter.policies.requiresIntake ? "destructive" : "secondary"}>
                        {shelter.policies.requiresIntake ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Emergency Only</span>
                      <Badge variant={shelter.policies.emergencyOnly ? "destructive" : "secondary"}>
                        {shelter.policies.emergencyOnly ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    {shelter.policies.maxStayDays && (
                      <div className="flex items-center justify-between">
                        <span>Maximum Stay</span>
                        <Badge variant="outline">
                          {shelter.policies.maxStayDays} days
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Accessibility & Accommodations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Wheelchair Accessible</span>
                      <Badge variant={shelter.policies.wheelchairAccessible ? "secondary" : "outline"}>
                        {shelter.policies.wheelchairAccessible ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Pets Allowed</span>
                      <Badge variant={shelter.policies.allowsPets ? "secondary" : "outline"}>
                        {shelter.policies.allowsPets ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Security Staff</span>
                      <Badge variant={shelter.services.security ? "secondary" : "outline"}>
                        {shelter.services.security ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Find Emergency Shelter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          {locationError ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {locationError}
                <Button variant="link" className="ml-2 h-auto p-0" onClick={getUserLocation}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : userLocation ? (
            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                Using your current location for distance calculations
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Getting your location for better results...
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="populationType">Who needs shelter?</Label>
              <Select 
                value={searchCriteria.populationType || ''} 
                onValueChange={(value) => updateSearchCriteria('populationType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any population" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any population</SelectItem>
                  <SelectItem value="men">Single men</SelectItem>
                  <SelectItem value="women">Single women</SelectItem>
                  <SelectItem value="families">Families with children</SelectItem>
                  <SelectItem value="youth">Youth/Young adults</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxDistance">Maximum distance</Label>
              <Select 
                value={searchCriteria.maxDistance.toString()} 
                onValueChange={(value) => updateSearchCriteria('maxDistance', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAvailableBeds"
                checked={searchCriteria.hasAvailableBeds}
                onCheckedChange={(checked) => updateSearchCriteria('hasAvailableBeds', checked)}
              />
              <Label htmlFor="hasAvailableBeds">Only show available beds</Label>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Accommodations</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceptsPets"
                        checked={searchCriteria.acceptsPets}
                        onCheckedChange={(checked) => updateSearchCriteria('acceptsPets', checked)}
                      />
                      <Label htmlFor="acceptsPets">Pet-friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wheelchairAccessible"
                        checked={searchCriteria.wheelchairAccessible}
                        onCheckedChange={(checked) => updateSearchCriteria('wheelchairAccessible', checked)}
                      />
                      <Label htmlFor="wheelchairAccessible">Wheelchair accessible</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Admission Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emergencyOnly"
                        checked={searchCriteria.emergencyOnly === true}
                        onCheckedChange={(checked) => updateSearchCriteria('emergencyOnly', checked ? true : undefined)}
                      />
                      <Label htmlFor="emergencyOnly">Emergency shelters only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noIntake"
                        checked={searchCriteria.requiresIntake === false}
                        onCheckedChange={(checked) => updateSearchCriteria('requiresIntake', checked ? false : undefined)}
                      />
                      <Label htmlFor="noIntake">No intake process required</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Services</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {SERVICE_OPTIONS.map(service => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={searchCriteria.hasSpecialServices.includes(service.id)}
                          onCheckedChange={() => toggleSpecialService(service.id)}
                        />
                        <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results Summary */}
      {summary && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.totalFound}</div>
                <div className="text-sm text-gray-600">Shelters Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.withAvailability}</div>
                <div className="text-sm text-gray-600">With Available Beds</div>
              </div>
              {summary.averageDistance && (
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.averageDistance.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Distance (mi)</div>
                </div>
              )}
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={searchShelters}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Finding shelters...</p>
          </div>
        ) : shelters.length > 0 ? (
          <>
            {shelters.map(renderShelterCard)}
            
            {shelters.length >= searchCriteria.limit && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Showing {shelters.length} results. Adjust your filters to see more options.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => updateSearchCriteria('limit', searchCriteria.limit + 10)}
                  >
                    Load More Results
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold mb-2">No shelters found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or expanding your search distance.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchCriteria({
                    ...searchCriteria,
                    maxDistance: 50,
                    hasAvailableBeds: false,
                    hasSpecialServices: []
                  });
                }}
              >
                Broaden Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Shelter Details Modal */}
      {renderShelterDetails()}
    </div>
  );
}