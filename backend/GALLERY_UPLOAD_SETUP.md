# Gallery Image Upload Setup Guide

## Overview

The SafarSaga gallery system now uses a proper file upload workflow with Supabase Storage instead of storing base64 encoded images in the database. This approach is more efficient, scalable, and follows industry best practices.

## Architecture

### Upload Workflow
1. **Frontend requests signed URL**: Admin uploads a file and frontend calls `/api/gallery/upload/signed-url`
2. **Backend generates signed URL**: Server creates a temporary upload URL using Supabase Storage
3. **Frontend uploads directly**: File is uploaded directly to Supabase Storage using the signed URL
4. **Frontend gets public URL**: After successful upload, frontend receives the permanent public URL
5. **Frontend saves URL**: Frontend calls `/api/gallery/albums/{album_id}/images` with just the URL

### Benefits
- **Performance**: No large payloads through your API
- **Scalability**: Direct uploads to storage service
- **Database efficiency**: Only URLs stored in database, not binary data
- **Validation**: No more character limit issues with base64 encoding

## Supabase Storage Setup

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** section
2. Click **Create Bucket**
3. Name: `gallery_images`
4. Set as **Public bucket** (for public image access)
5. Click **Create bucket**

### 2. Set Bucket Policies

Add these RLS policies for the `gallery_images` bucket:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery_images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view files
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery_images');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery_images' 
  AND auth.role() = 'authenticated'
);
```

### 3. Configure CORS (if needed)

If you encounter CORS issues, add your frontend domain to the allowed origins in Supabase settings.

## API Endpoints

### Generate Signed Upload URL

```http
POST /api/gallery/upload/signed-url
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "file_name": "my-image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "upload_url": "https://xxx.supabase.co/storage/v1/object/upload/sign/gallery_images/uuid-filename.jpg?token=...",
  "file_path": "uuid-filename.jpg",
  "public_url": "https://xxx.supabase.co/storage/v1/object/public/gallery_images/uuid-filename.jpg"
}
```

### Add Image to Album

```http
POST /api/gallery/albums/{album_id}/images
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "image_url": "https://xxx.supabase.co/storage/v1/object/public/gallery_images/uuid-filename.jpg",
  "caption": "Optional image caption",
  "display_order": 0
}
```

## Frontend Implementation Example

```typescript
// 1. Get signed upload URL
const getUploadUrl = async (file: File) => {
  const response = await fetch('/api/gallery/upload/signed-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type
    })
  });
  return response.json();
};

// 2. Upload file directly to storage
const uploadFile = async (file: File, uploadUrl: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
};

// 3. Save image URL to album
const addImageToAlbum = async (albumId: string, imageUrl: string, caption?: string) => {
  const response = await fetch(`/api/gallery/albums/${albumId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption,
      display_order: 0
    })
  });
  return response.json();
};

// Complete upload flow
const handleImageUpload = async (file: File, albumId: string, caption?: string) => {
  try {
    // Step 1: Get signed URL
    const { upload_url, public_url } = await getUploadUrl(file);
    
    // Step 2: Upload file
    await uploadFile(file, upload_url);
    
    // Step 3: Save to album
    const result = await addImageToAlbum(albumId, public_url, caption);
    
    console.log('Image uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

## Database Schema

The database only stores URLs, not binary data:

```sql
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,  -- Only stores the URL (max 2000 chars)
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Validation Changes

- **Before**: `image_url` had 1000 character limit (caused base64 failures)
- **After**: `image_url` has 2000 character limit (sufficient for storage URLs)
- **Validation**: Only accepts proper URLs, not base64 data

## Error Handling

Common errors and solutions:

1. **"String should have at most 1000 characters"**: Fixed by increasing limit to 2000
2. **"gallery_images is not an embedded resource"**: Fixed by correcting query syntax
3. **"Invalid input syntax for type uuid"**: Fixed by converting empty strings to None
4. **CORS errors**: Configure allowed origins in Supabase settings
5. **Upload permission errors**: Check storage bucket policies

## Migration Notes

If you have existing base64 images in the database, you'll need to:

1. Extract the base64 data
2. Convert to binary files
3. Upload to Supabase Storage
4. Update database records with new URLs
5. Clean up old base64 data

## Security Considerations

- Signed URLs expire after 1 hour
- Only authenticated admin users can generate upload URLs
- File uploads go directly to storage (not through your API)
- Public URLs are read-only
- Consider adding file type and size validation
