/**
 * API Service Layer
 * Handles all REST API operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Authentication API
 */
export const authApi = {
  async verifyToken(token: string): Promise<ApiResponse<{ user: { id: string; username: string } }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  async refreshAuthToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },
};

/**
 * User preferences API
 */
export const userApi = {
  async updatePreferences(userId: string, preferences: { languages: string[]; vibe: string[] }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },
};

/**
 * Matchmaking API
 */
export const matchApi = {
  async joinQueue(userId: string, preferences: { languages: string[]; vibe: string[] }): Promise<ApiResponse<{ queueId: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/match/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, preferences }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  async leaveQueue(queueId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/match/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queueId }),
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },
};
