'use client';

import { useState, useEffect } from 'react';
import { Camera, Plus, FolderPlus, Image as ImageIcon, Trash2, Edit, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getAlbums,
  getAlbumWithImages,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
  updateImage,
  deleteImage,
  getGalleryStats,
  generateSignedUploadUrl,
  uploadFileToStorage,
  type GalleryAlbum,
  type GalleryAlbumWithImages,
  type GalleryAlbumImage,
} from '@/lib/gallery-api';

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbumWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_albums: 0, total_images: 0, average_images_per_album: 0 });
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);

  // Form states
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', destination_id: '' });
  const [imageForm, setImageForm] = useState({ image_url: '', caption: '', display_order: 0 });
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [albumsData, statsData] = await Promise.all([
        getAlbums(),
        getGalleryStats(),
      ]);
      setAlbums(albumsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumDetails = async (albumId: string) => {
    try {
      const albumData = await getAlbumWithImages(albumId);
      setSelectedAlbum(albumData);
    } catch (err: any) {
      setError(err.message || 'Failed to load album details');
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlbum(albumForm);
      setSuccess('Album created successfully!');
      setShowCreateAlbum(false);
      setAlbumForm({ title: '', description: '', destination_id: '' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create album');
    }
  };

  const handleEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumForm({
      title: album.title,
      description: album.description || '',
      destination_id: album.destination_id || ''
    });
    setShowEditAlbum(true);
  };

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    try {
      await updateAlbum(editingAlbum.id, albumForm);
      setSuccess('Album updated successfully!');
      setShowEditAlbum(false);
      setEditingAlbum(null);
      setAlbumForm({ title: '', description: '', destination_id: '' });
      loadData();
      // Update selected album if it's the one being edited
      if (selectedAlbum && selectedAlbum.id === editingAlbum.id) {
        loadAlbumDetails(editingAlbum.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update album');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Are you sure? This will delete the album and all its images.')) return;
    
    try {
      await deleteAlbum(albumId);
      setSuccess('Album deleted successfully!');
      setSelectedAlbum(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete album');
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;

    try {
      setUploading(true);
      let imageUrl = imageForm.image_url;

      // Handle file upload if file is selected
      if (uploadMode === 'file' && selectedFile) {
        // Step 1: Get signed upload URL
        const { upload_url, public_url } = await generateSignedUploadUrl(
          selectedFile.name,
          selectedFile.type
        );

        // Step 2: Upload file to storage
        await uploadFileToStorage(selectedFile, upload_url);

        // Step 3: Use the public URL
        imageUrl = public_url;
      }

      // Step 4: Save image record to database
      await addImageToAlbum(selectedAlbum.id, {
        ...imageForm,
        image_url: imageUrl,
      });

      setSuccess('Image added successfully!');
      setShowAddImage(false);
      setImageForm({ image_url: '', caption: '', display_order: 0 });
      setSelectedFile(null);
      setUploadMode('file');
      loadAlbumDetails(selectedAlbum.id);
    } catch (err: any) {
      setError(err.message || 'Failed to add image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(imageId);
      setSuccess('Image deleted successfully!');
      if (selectedAlbum) {
        loadAlbumDetails(selectedAlbum.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-1">Manage your travel photo albums</p>
        </div>
        <div className="flex gap-3">
          <Link href="/gallery">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Gallery
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {success}
          <button onClick={() => setSuccess(null)} className="absolute top-2 right-2 text-green-500 hover:text-green-700">
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Albums</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_albums}</p>
            </div>
            <FolderPlus className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_images}</p>
            </div>
            <ImageIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Images/Album</p>
              <p className="text-2xl font-bold text-gray-900">{stats.average_images_per_album.toFixed(1)}</p>
            </div>
            <Camera className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Albums List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Albums</h2>
              <Button onClick={() => setShowCreateAlbum(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Album
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {albums.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No albums yet. Create your first album!</p>
              </div>
            ) : (
              albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => loadAlbumDetails(album.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedAlbum?.id === album.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{album.title}</h3>
                      {album.description && (
                        <p className="text-sm text-gray-600 mt-1">{album.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{album.image_count} images</span>
                        {album.destination_name && <span>• {album.destination_name}</span>}
                      </div>
                    </div>
                    {album.cover_image_url && (
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Album Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedAlbum ? selectedAlbum.title : 'Select an Album'}
              </h2>
              {selectedAlbum && (
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddImage(true)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <Button
                    onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleEditAlbum(selectedAlbum)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Album
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {!selectedAlbum ? (
              <div className="text-center py-12 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select an album to view its images</p>
              </div>
            ) : selectedAlbum.images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No images in this album yet</p>
                <Button onClick={() => setShowAddImage(true)} className="mt-4" size="sm">
                  Add First Image
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {selectedAlbum.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt={image.caption || ''}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Album Modal */}
      {showCreateAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Title *</label>
                <input
                  type="text"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateAlbum(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Album</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditAlbum && editingAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Album</h3>
            <form onSubmit={handleUpdateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Title *</label>
                <input
                  type="text"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditAlbum(false);
                    setEditingAlbum(null);
                    setAlbumForm({ title: '', description: '', destination_id: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Album</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Image Modal */}
      {showAddImage && selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Image to {selectedAlbum.title}</h3>
            <form onSubmit={handleAddImage} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadMode === 'file'}
                      onChange={(e) => setUploadMode(e.target.value as 'file' | 'url')}
                      className="mr-2"
                    />
                    Upload File
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="url"
                      checked={uploadMode === 'url'}
                      onChange={(e) => setUploadMode(e.target.value as 'file' | 'url')}
                      className="mr-2"
                    />
                    Image URL
                  </label>
                </div>
              </div>

              {/* File Upload */}
              {uploadMode === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Image File *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {/* URL Input */}
              {uploadMode === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <input
                    type="url"
                    value={imageForm.image_url}
                    onChange={(e) => setImageForm({ ...imageForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input
                  type="text"
                  value={imageForm.caption}
                  onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={imageForm.display_order}
                  onChange={(e) => setImageForm({ ...imageForm, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddImage(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add Image'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
