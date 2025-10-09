/**
 * Admin Settings Service
 * Handles all settings-related API calls for the admin dashboard
 */

import adminApi, { getErrorMessage } from './admin-api';

// Types for settings data
export interface AppSettings {
  id: number;
  // General Settings (Company Profile)
  company_name?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  
  // Social Media Links
  social_facebook_url?: string;
  social_instagram_url?: string;
  social_twitter_url?: string;
  social_linkedin_url?: string;
  social_youtube_url?: string;
  
  // Booking & Payment Settings
  payment_gateway_key?: string;
  payment_gateway_secret?: string;
  currency?: string;
  gstin?: string;
  gst_rate?: number;
  terms_and_conditions?: string;
  
  // System Settings
  maintenance_mode?: boolean;
  notify_on_new_booking?: boolean;
  notify_on_new_user?: boolean;
  notify_on_payment?: boolean;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface AppSettingsUpdate {
  // General Settings (Company Profile)
  company_name?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  
  // Social Media Links
  social_facebook_url?: string;
  social_instagram_url?: string;
  social_twitter_url?: string;
  social_linkedin_url?: string;
  social_youtube_url?: string;
  
  // Booking & Payment Settings
  payment_gateway_key?: string;
  payment_gateway_secret?: string;
  currency?: string;
  gstin?: string;
  gst_rate?: number;
  terms_and_conditions?: string;
  
  // System Settings
  maintenance_mode?: boolean;
  notify_on_new_booking?: boolean;
  notify_on_new_user?: boolean;
  notify_on_payment?: boolean;
}

export interface MaintenanceStatus {
  maintenance_mode: boolean;
  message?: string;
}

export class AdminSettingsService {
  /**
   * Get current application settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const response = await adminApi.get('/api/settings/');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update application settings
   */
  static async updateSettings(settingsData: AppSettingsUpdate): Promise<AppSettings> {
    try {
      const response = await adminApi.put('/api/settings/', settingsData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get maintenance mode status (public endpoint)
   */
  static async getMaintenanceStatus(): Promise<MaintenanceStatus> {
    try {
      const response = await adminApi.get('/api/settings/maintenance-status');
      return response.data;
    } catch (error) {
      return {
        maintenance_mode: false,
        message: undefined,
      };
    }
  }

  /**
   * Update general settings (company profile, contact info, social media)
   */
  static async updateGeneralSettings(generalData: Partial<AppSettingsUpdate>): Promise<AppSettings> {
    const updateData: AppSettingsUpdate = {};
    
    // Company profile
    if (generalData.company_name !== undefined) updateData.company_name = generalData.company_name;
    if (generalData.logo_url !== undefined) updateData.logo_url = generalData.logo_url;
    if (generalData.contact_email !== undefined) updateData.contact_email = generalData.contact_email;
    if (generalData.contact_phone !== undefined) updateData.contact_phone = generalData.contact_phone;
    if (generalData.address !== undefined) updateData.address = generalData.address;
    
    // Social media links
    if (generalData.social_facebook_url !== undefined) updateData.social_facebook_url = generalData.social_facebook_url;
    if (generalData.social_instagram_url !== undefined) updateData.social_instagram_url = generalData.social_instagram_url;
    if (generalData.social_twitter_url !== undefined) updateData.social_twitter_url = generalData.social_twitter_url;
    if (generalData.social_linkedin_url !== undefined) updateData.social_linkedin_url = generalData.social_linkedin_url;
    if (generalData.social_youtube_url !== undefined) updateData.social_youtube_url = generalData.social_youtube_url;

    return this.updateSettings(updateData);
  }

  /**
   * Update payment settings (payment gateway, currency, GST, terms)
   */
  static async updatePaymentSettings(paymentData: Partial<AppSettingsUpdate>): Promise<AppSettings> {
    const updateData: AppSettingsUpdate = {};
    
    // Payment gateway settings
    if (paymentData.payment_gateway_key !== undefined) updateData.payment_gateway_key = paymentData.payment_gateway_key;
    if (paymentData.payment_gateway_secret !== undefined) updateData.payment_gateway_secret = paymentData.payment_gateway_secret;
    if (paymentData.currency !== undefined) updateData.currency = paymentData.currency;
    if (paymentData.gstin !== undefined) updateData.gstin = paymentData.gstin;
    if (paymentData.gst_rate !== undefined) updateData.gst_rate = paymentData.gst_rate;
    if (paymentData.terms_and_conditions !== undefined) updateData.terms_and_conditions = paymentData.terms_and_conditions;

    return this.updateSettings(updateData);
  }

  /**
   * Update system settings (maintenance mode, notifications)
   */
  static async updateSystemSettings(systemData: Partial<AppSettingsUpdate>): Promise<AppSettings> {
    const updateData: AppSettingsUpdate = {};
    
    // System settings
    if (systemData.maintenance_mode !== undefined) updateData.maintenance_mode = systemData.maintenance_mode;
    if (systemData.notify_on_new_booking !== undefined) updateData.notify_on_new_booking = systemData.notify_on_new_booking;
    if (systemData.notify_on_new_user !== undefined) updateData.notify_on_new_user = systemData.notify_on_new_user;
    if (systemData.notify_on_payment !== undefined) updateData.notify_on_payment = systemData.notify_on_payment;

    return this.updateSettings(updateData);
  }

  /**
   * Toggle maintenance mode
   */
  static async toggleMaintenanceMode(enabled: boolean): Promise<AppSettings> {
    return this.updateSystemSettings({ maintenance_mode: enabled });
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export static methods as adminSettingsService object
export const adminSettingsService = {
  getSettings: AdminSettingsService.getSettings,
  updateSettings: AdminSettingsService.updateSettings,
  getMaintenanceStatus: AdminSettingsService.getMaintenanceStatus,
  updateGeneralSettings: AdminSettingsService.updateGeneralSettings,
  updatePaymentSettings: AdminSettingsService.updatePaymentSettings,
  updateSystemSettings: AdminSettingsService.updateSystemSettings,
  toggleMaintenanceMode: AdminSettingsService.toggleMaintenanceMode,
};

export default AdminSettingsService;
