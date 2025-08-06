import { interactionsService } from './api';

export interface UserStats {
  totalLikes: number;
  totalMatches: number;
  newMessages: number;
  profileViews: number;
  likesReceived: number;
  profileCompleteness: number;
  lastActive: string;
}

export interface ActivityItem {
  id: string;
  type: 'like_received' | 'match' | 'message' | 'profile_view' | 'event';
  title: string;
  description: string;
  timestamp: string;
  isReal: boolean;
}

class UserStatsService {
  private stats: UserStats | null = null;
  private activities: ActivityItem[] = [];

  // Get user statistics from backend or generate realistic defaults
  async getUserStats(): Promise<UserStats> {
    try {
      // Try to fetch real stats from interactions service
      const response = await interactionsService.getUserStats();
      if (response) {
        this.stats = {
          totalLikes: response.totalLikes || 0,
          totalMatches: response.totalMatches || 0,
          newMessages: 0, // Messages are handled separately
          profileViews: response.profileViews || 0,
          likesReceived: response.likesReceived || 0,
          profileCompleteness: this.calculateProfileCompleteness(),
          lastActive: new Date().toISOString()
        };
        return this.stats;
      }
    } catch (error) {
      console.warn('Failed to fetch real user stats, using defaults:', error);
    }

    // Fallback to realistic defaults
    this.stats = {
      totalLikes: 0,
      totalMatches: 0,
      newMessages: 0,
      profileViews: 0,
      likesReceived: 0,
      profileCompleteness: this.calculateProfileCompleteness(),
      lastActive: new Date().toISOString()
    };

    return this.stats;
  }

  // Get recent activities - only show real activities
  async getRecentActivities(): Promise<ActivityItem[]> {
    // For now, return empty array since we don't have a real activities API
    // This prevents showing fake activities
    this.activities = [];
    return this.activities;
  }

  // Calculate profile completeness based on filled fields
  private calculateProfileCompleteness(): number {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let score = 0;
      let total = 0;

      // Basic fields (20 points each)
      const basicFields = ['first_name', 'last_name', 'email', 'age', 'bio'];
      basicFields.forEach(field => {
        total += 20;
        if (user[field] && user[field].toString().trim()) {
          score += 20;
        }
      });

      return Math.round((score / total) * 100);
    } catch {
      return 0;
    }
  }

  // Check if user has any real activity
  hasRealActivity(): boolean {
    return this.activities.length > 0;
  }

  // Get stats or null if no data available
  getCachedStats(): UserStats | null {
    return this.stats;
  }
}

export const userStatsService = new UserStatsService();
