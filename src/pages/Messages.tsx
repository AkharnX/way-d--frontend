import React, { useState, useEffect } from 'react';
import type { Match, Message } from '../types';
import { interactionsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { logError, getErrorMessage } from '../utils/errorUtils';

const Messages: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    if (!selectedMatch || !newMessage.trim()) return;

    try {
      const message = await interactionsService.sendMessage(selectedMatch.id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error: any) {
      logError('Error sending message:', error);
      setError(getErrorMessage(error));
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    loadMessages(match.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={loadMatches} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Matches List */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Matches</h2>
        </div>
        <div className="overflow-y-auto">
          {matches.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No matches yet. Keep swiping!
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                onClick={() => handleMatchSelect(match)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedMatch?.id === match.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    {match.profile.profile_photo_url ? (
                      <img
                        src={match.profile.profile_photo_url}
                        alt={match.profile.first_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-gray-400">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {match.profile.first_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {match.last_message?.content || 'Start a conversation!'}
                    </p>
                  </div>
                  {match.last_message && (
                    <div className="text-xs text-gray-500">
                      {new Date(match.last_message.sent_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                {selectedMatch.profile.profile_photo_url ? (
                  <img
                    src={selectedMatch.profile.profile_photo_url}
                    alt={selectedMatch.profile.first_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-400">👤</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedMatch.profile.first_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedMatch.profile.age} years old
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">💬</div>
              <p>Select a match to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
