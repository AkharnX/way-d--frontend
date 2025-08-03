import React, { useState, useEffect } from 'react';
import { eventsService } from '../services/api';
import { Calendar, MapPin, Users, Clock, Plus, Search, Heart, ArrowRight } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  type: 'Public' | 'Private';
  max_capacity?: number;
  participant_count: number;
  user_participant?: any;
  created_by?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-events' | 'participating'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Public' | 'Private'>('all');

  useEffect(() => {
    loadEvents();
    loadMyEvents();
    loadMyParticipations();
  }, []);

  const loadEvents = async () => {
    try {
      const params: any = { page: 1, limit: 20 };
      if (filterType !== 'all') params.type = filterType;
      
      const response = await eventsService.getEvents(params);
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadMyEvents = async () => {
    try {
      const events = await eventsService.getMyEvents();
      setMyEvents(events);
    } catch (error) {
      console.error('Error loading my events:', error);
    }
  };

  const loadMyParticipations = async () => {
    try {
      const participations = await eventsService.getMyParticipations();
      setMyParticipations(participations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading participations:', error);
      setLoading(false);
    }
  };

  const handleParticipate = async (eventId: string) => {
    try {
      await eventsService.participateInEvent(eventId);
      loadEvents();
      loadMyParticipations();
    } catch (error) {
      console.error('Error participating in event:', error);
    }
  };

  const handleCancelParticipation = async (eventId: string) => {
    try {
      await eventsService.cancelParticipation(eventId);
      loadEvents();
      loadMyParticipations();
    } catch (error) {
      console.error('Error canceling participation:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EventCard = ({ event, showParticipateButton = true }: { event: Event; showParticipateButton?: boolean }) => {
    const isParticipating = event.user_participant?.status === 'Inscrit';
    const isFull = event.max_capacity && event.participant_count >= event.max_capacity;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 bg-gradient-to-br from-pink-400 to-purple-600">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              event.type === 'Public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {event.type === 'Public' ? '🌍 Public' : '🔒 Privé'}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold mb-1">{event.name}</h3>
            <div className="flex items-center text-sm opacity-90">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(event.start_date)}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              {event.participant_count} participant{event.participant_count > 1 ? 's' : ''}
              {event.max_capacity && ` / ${event.max_capacity} max`}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              Jusqu'au {formatDate(event.end_date)}
            </div>
          </div>

          {showParticipateButton && (
            <div className="flex gap-2">
              {isParticipating ? (
                <button
                  onClick={() => handleCancelParticipation(event.id)}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-xl hover:bg-red-200 transition-colors"
                >
                  Se désinscrire
                </button>
              ) : (
                <button
                  onClick={() => handleParticipate(event.id)}
                  disabled={!!isFull}
                  className={`flex-1 py-2 px-4 rounded-xl transition-colors ${
                    isFull
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                  }`}
                >
                  {isFull ? 'Complet' : 'Participer'}
                </button>
              )}
              <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Événements Way-d
          </h1>
          <p className="text-gray-600 text-lg">
            Participez à des événements passionnants et rencontrez de nouvelles personnes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🔍 Découvrir
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'my-events'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📅 Mes événements
          </button>
          <button
            onClick={() => setActiveTab('participating')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'participating'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🎉 Mes participations
          </button>
        </div>

        {/* Search and Filters */}
        {activeTab === 'discover' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des événements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="Public">Public</option>
                  <option value="Private">Privé</option>
                </select>
                <button
                  disabled
                  className="flex items-center px-6 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un événement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'discover' && filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {activeTab === 'my-events' && myEvents.map(event => (
            <EventCard key={event.id} event={event} showParticipateButton={false} />
          ))}
          
          {activeTab === 'participating' && myParticipations.map(participation => (
            <EventCard key={participation.event.id} event={participation.event} />
          ))}
        </div>

        {/* Empty State */}
        {((activeTab === 'discover' && filteredEvents.length === 0) ||
          (activeTab === 'my-events' && myEvents.length === 0) ||
          (activeTab === 'participating' && myParticipations.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'discover' ? '🔍' : activeTab === 'my-events' ? '📅' : '🎉'}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === 'discover' && 'Aucun événement trouvé'}
              {activeTab === 'my-events' && 'Vous n\'avez créé aucun événement'}
              {activeTab === 'participating' && 'Vous ne participez à aucun événement'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'discover' && 'Essayez de modifier vos critères de recherche'}
              {activeTab === 'my-events' && 'Créez votre premier événement pour commencer'}
              {activeTab === 'participating' && 'Découvrez des événements intéressants et participez'}
            </p>
            {activeTab !== 'discover' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Découvrir des événements
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
