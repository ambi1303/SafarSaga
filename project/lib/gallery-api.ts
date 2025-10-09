/**
 * Gallery Albums API Client
 * Uses both public and admin API calls
 */

import adminApi from './admin-api';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a public API instance for non-authenticated calls
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Types (interfaces remain the same)
export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  destination_id?: string;
  destination_name?: string;
  image_count: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbumImage {
  id: string;
  album_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbumWithImages extends GalleryAlbum {
  images: GalleryAlbumImage[];
}

export interface CreateAlbumData {
  title: string;
  description?: string;
  destination_id?: string;
}

export interface UpdateAlbumData {
  title?: string;
  description?: string;
  destination_id?: string;
}

export interface CreateImageData {
  image_url: string;
  caption?: string;
  display_order?: number;
}

export interface UpdateImageData {
  image_url?: string;
  caption?: string;
  display_order?: number;
}

export interface GalleryStats {
  total_albums: number;
  total_images: number;
  average_images_per_album: number;
}

// ==================== ALBUM OPERATIONS ====================

/**
 * Create a new gallery album (Admin only)
 */
export async function createAlbum(data: CreateAlbumData): Promise<GalleryAlbum> {
  const response = await adminApi.post('/api/gallery-albums/albums', data);
  return response.data;
}

/**
 * Get all gallery albums (Public access)
 */
export async function getAlbums(destinationId?: string): Promise<GalleryAlbum[]> {
  const response = await publicApi.get('/api/gallery-albums/albums', {
    params: { destination_id: destinationId },
  });
  return response.data;
}

/**
 * Get a specific album with all its images (Public access)
 */
export async function getAlbumWithImages(albumId: string): Promise<GalleryAlbumWithImages> {
  const response = await publicApi.get(`/api/gallery-albums/albums/${albumId}`);
  return response.data;
}

/**
 * Update an album (Admin only)
 */
export async function updateAlbum(albumId: string, data: UpdateAlbumData): Promise<GalleryAlbum> {
  const response = await adminApi.put(`/api/gallery-albums/albums/${albumId}`, data);
  return response.data;
}

/**
 * Delete an album and all its images (Admin only)
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  const response = await adminApi.delete(`/api/gallery-albums/albums/${albumId}`);
  return response.data; // Although it's void, axios might return something
}

// ==================== IMAGE OPERATIONS ====================

/**
 * Add an image to an album (Admin only)
 */
export async function addImageToAlbum(
  albumId: string,
  data: CreateImageData
): Promise<GalleryAlbumImage> {
  const response = await adminApi.post(`/api/gallery-albums/albums/${albumId}/images`, data);
  return response.data;
}

/**
 * Update an image (Admin only)
 */
export async function updateImage(imageId: string, data: UpdateImageData): Promise<GalleryAlbumImage> {
  const response = await adminApi.put(`/api/gallery-albums/images/${imageId}`, data);
  return response.data;
}

/**
 * Delete an image (Admin only)
 */
export async function deleteImage(imageId: string): Promise<void> {
  const response = await adminApi.delete(`/api/gallery-albums/images/${imageId}`);
  return response.data;
}

// ==================== FILE UPLOAD ====================

/**
 * Generate signed upload URL for file upload (Admin only)
 */
export async function generateSignedUploadUrl(fileName: string, contentType?: string): Promise<{
  upload_url: string;
  file_path: string;
  public_url: string;
}> {
  const response = await adminApi.post('/api/gallery-albums/upload/signed-url', {
    file_name: fileName,
    content_type: contentType,
  });
  return response.data;
}

/**
 * Upload file directly to storage using signed URL
 */
export async function uploadFileToStorage(file: File, uploadUrl: string): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

// ==================== STATISTICS ====================

/**
 * Get gallery statistics (Admin only)
 */
export async function getGalleryStats(): Promise<GalleryStats> {
  const response = await adminApi.get('/api/gallery-albums/stats');
  return response.data;
}
