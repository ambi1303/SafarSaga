/**
 * Admin User Management Service
 */

import adminApi, { getErrorMessage } from './admin-api'
import { User } from './auth-api'

export interface UserListItem extends User {
  total_bookings?: number
  total_spent?: number
  last_booking_date?: string
  account_status?: 'active' | 'inactive' | 'suspended'
}

export interface UserDetails extends UserListItem {
  bookings?: any[]
}

export class UsersAdminService {
  /**
   * Get all users
   */
  static async getUsers(
    search?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: UserListItem[]; total: number }> {
    try {
      // Note: This endpoint might need to be created in the backend
      const params: any = { limit, offset }
      if (search) params.search = search

      const response = await adminApi.get('/api/users/', { params })
      return {
        items: response.data.items || response.data || [],
        total: response.data.total || response.data.length || 0
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserDetails> {
    try {
      const response = await adminApi.get(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    try {
      const response = await adminApi.put(`/api/users/${userId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      await adminApi.put(`/api/users/${userId}`, { account_status: 'inactive' })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Activate user
   */
  static async activateUser(userId: string): Promise<void> {
    try {
      await adminApi.put(`/api/users/${userId}`, { account_status: 'active' })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await adminApi.delete(`/api/users/${userId}`)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }
}
