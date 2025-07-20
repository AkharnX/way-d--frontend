import React, { useState, useEffect } from 'react';
import type { Match, Message } from '../types';
import { interactionsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { logError, getErrorMessage } from '../utils/errorUtils';
import { Send, Heart, Search, MoreVertical, Loader2, MessageCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Messages: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await interactionsService.getMatches();
      setMatches(data);
    } catch (error: any) {
      logError('Error loading matches:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const data = await interactionsService.getMessages(matchId);
      setMessages(data);
    } catch (error: any) {
      logError('Error loading messages:', error);
      setError(getErrorMessage(error));
    }
  };

  const sendMessage = async () => {
    if (!selectedMatch || !newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const message = await interactionsService.sendMessage(selectedMatch.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error: any) {
      logError('Error sending message:', error);
      setError(getErrorMessage(error));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    loadMessages(match.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredMatches = matches.filter(match =>
    match.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 way-d-secondary animate-spin mx-auto mb-4" />
          <p className="text-white/90 text-lg">Chargement de vos conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-white/90 mb-6 text-lg">{error}</div>
          <button onClick={loadMatches} className="btn-secondary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen gradient-bg flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 lg:hidden">
        <PageHeader 
          title="Messages"
          showBack={true}
          customBackAction={() => window.history.back()}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Matches Sidebar */}
        <div className={`${selectedMatch ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo_blue.svg" 
                  alt="Way-d" 
                  className="h-8 w-auto"
                />
                <h1 className="text-2xl font-bold way-d-primary">Messages</h1>
              </div>
              <div className="w-10 h-10 bg-way-d-secondary rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-way-d-secondary focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>

          {/* Matches List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMatches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Heart className="w-16 h-16 text-way-d-secondary/30 mx-auto mb-6" />
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Aucune conversation</h3>
                <p className="text-gray-600">
                  {matches.length === 0 
                    ? "Commencez à swiper pour obtenir des matches !" 
                    : "Aucun résultat pour votre recherche"
                  }
                </p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => handleMatchSelect(match)}
                  className={`p-5 border-b border-gray-100 cursor-pointer hover:bg-way-d-secondary/5 transition-all duration-200 ${
                    selectedMatch?.id === match.id ? 'bg-way-d-secondary/10 border-r-4 border-way-d-secondary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
                        {match.profile?.profile_photo_url ? (
                          <img
                            src={match.profile.profile_photo_url}
                            alt={match.profile.first_name || 'Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-way-d-primary flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {match.profile?.first_name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-way-d-secondary border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold way-d-primary truncate text-lg">
                          {match.profile?.first_name || 'Utilisateur'}
                        </h3>
                        {match.last_message && (
                          <span className="text-sm text-gray-500 font-medium">
                            {formatMessageTime(match.last_message.sent_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {match.last_message?.content || 'Nouveau match ! Dites bonjour 👋'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedMatch ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
          {selectedMatch ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedMatch(null)}
                    className="lg:hidden p-2 -m-2 text-gray-600 hover:text-gray-900"
                  >
                    ←
                  </button>
                  
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    {selectedMatch.profile?.profile_photo_url ? (
                      <img
                        src={selectedMatch.profile.profile_photo_url}
                        alt={selectedMatch.profile.first_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {selectedMatch.profile?.first_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedMatch.profile?.first_name || 'Utilisateur'}
                    </h3>
                    <p className="text-sm text-green-600">En ligne</p>
                  </div>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      C'est le début de votre conversation !
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Vous avez matché avec {selectedMatch.profile?.first_name || 'cette personne'}. 
                      Envoyez un message pour commencer la conversation !
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isMyMessage = message.sender_id === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${
                          showAvatar ? 'mt-4' : 'mt-1'
                        }`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                          isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          {!isMyMessage && showAvatar && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                              {selectedMatch.profile?.profile_photo_url ? (
                                <img
                                  src={selectedMatch.profile.profile_photo_url}
                                  alt={selectedMatch.profile.first_name || 'Profile'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {selectedMatch.profile?.first_name?.[0]?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isMyMessage
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            } ${!showAvatar ? 'ml-10' : ''}`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMyMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(message.sent_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Écrivez à ${selectedMatch.profile?.first_name || 'cette personne'}...`}
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                      style={{ minHeight: '48px' }}
                      disabled={sendingMessage}
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No chat selected - desktop view
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vos conversations
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Sélectionnez une conversation pour commencer à chatter avec vos matches
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
