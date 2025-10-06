# Cloudinary Setup Guide for SafarSaga Gallery

This guide will help you set up Cloudinary for the dynamic gallery system.

## 1. Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After registration, you'll be taken to your dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret**

## 2. Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret

# Gallery Configuration
NEXT_PUBLIC_GALLERY_FOLDER=safarsaga-gallery
NEXT_PUBLIC_GALLERY_TAG=gallery
```

## 3. Set Up Upload Preset (Optional but Recommended)

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets** and click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `safarsaga_gallery`
   - **Signing Mode**: Unsigned (for direct uploads from frontend)
   - **Folder**: `safarsaga-gallery`
   - **Tags**: `gallery, travel, safarsaga`
   - **Transformations**: Add quality optimization and format auto-selection

## 4. Upload Your First Images

### Method 1: Using Cloudinary Dashboard
1. Go to **Media Library** in your Cloudinary dashboard
2. Click **Upload** button
3. Select your travel photos
4. In the upload dialog:
   - Set **Folder** to `safarsaga-gallery`
   - Add **Tags**: `gallery`, `travel`, and relevant destination tags (e.g., `manali`, `goa`, `kerala`)
   - Add **Context** metadata:
     - `alt`: Descriptive alt text for SEO
     - `caption`: Photo title/caption
     - `description`: Detailed description

### Method 2: Bulk Upload with Metadata
1. Prepare your images with descriptive filenames
2. Use Cloudinary's bulk upload feature
3. Set consistent folder and tags for all images

## 5. Organize Your Images

### Recommended Folder Structure:
```
safarsaga-gallery/
├── destinations/
│   ├── manali/
│   ├── goa/
│   ├── kerala/
│   └── rajasthan/
├── activities/
│   ├── trekking/
│   ├── beaches/
│   └── cultural/
└── featured/
```

### Recommended Tags:
- **Destinations**: `manali`, `goa`, `kerala`, `rajasthan`, `himachal`, etc.
- **Activities**: `trekking`, `beach`, `cultural`, `adventure`, `wildlife`
- **Seasons**: `summer`, `winter`, `monsoon`
- **Types**: `landscape`, `people`, `food`, `accommodation`
- **Special**: `featured`, `popular`, `new`

## 6. Test the Gallery

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/gallery`
3. You should see your uploaded images in the gallery
4. Test the search and filter functionality

## 7. Advanced Configuration

### Enable Webhooks (Optional)
1. In Cloudinary dashboard, go to **Settings** → **Webhooks**
2. Add a new webhook URL: `https://yourdomain.com/api/gallery`
3. Select events: `upload`, `delete`, `update`
4. This will automatically refresh the gallery when images are added/removed

### Optimize for Performance
1. Enable **Auto-optimization** in your Cloudinary settings
2. Set up **Responsive breakpoints** for different screen sizes
3. Configure **Lazy loading** thresholds

## 8. Content Management Workflow

### For Admins:
1. **Upload new photos**: Use Cloudinary dashboard or mobile app
2. **Add metadata**: Always include alt text, captions, and relevant tags
3. **Organize content**: Use consistent folder structure and tagging
4. **Feature content**: Use `featured` tag for homepage highlights

### Best Practices:
- Use descriptive filenames before uploading
- Add location and activity tags for better filtering
- Include alt text for accessibility and SEO
- Compress images before upload for faster processing
- Use consistent naming conventions

## 9. Troubleshooting

### Gallery not loading images:
- Check environment variables are correctly set
- Verify Cloudinary credentials in dashboard
- Ensure images are in the correct folder (`safarsaga-gallery`)
- Check browser console for API errors

### Images not appearing after upload:
- Wait a few minutes for Cloudinary processing
- Check if images have correct tags
- Verify folder path matches configuration
- Refresh the gallery page

### Performance issues:
- Reduce image file sizes before upload
- Use appropriate image formats (WebP when possible)
- Check Cloudinary transformation settings
- Monitor API usage in Cloudinary dashboard

## 10. Going Live

1. Update environment variables in your production deployment
2. Configure production webhook URLs
3. Set up monitoring for API usage and performance
4. Train content managers on upload workflow

## Support

For technical issues:
- Check Cloudinary documentation: https://cloudinary.com/documentation
- Review API logs in Cloudinary dashboard
- Test API endpoints directly using browser dev tools

The dynamic gallery system is now ready to showcase SafarSaga's travel experiences with professional image management capabilities!