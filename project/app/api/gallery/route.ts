import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryServerService } from '@/lib/cloudinary-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const folder = searchParams.get('folder') || undefined;
    const tags = searchParams.get('tags')?.split(',') || [];
    const maxResults = parseInt(searchParams.get('maxResults') || '12');
    const nextCursor = searchParams.get('nextCursor') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'created_at' | 'public_id' | 'uploaded_at') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const query = searchParams.get('query');

    let result;

    if (query) {
      // Search functionality
      result = await cloudinaryServerService.searchImages(query, {
        folder,
        maxResults,
        nextCursor,
      });
    } else {
      // Regular fetch
      result = await cloudinaryServerService.fetchGalleryImages({
        folder,
        tags,
        maxResults,
        nextCursor,
        sortBy,
        sortOrder,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint could be used for triggering gallery refresh
    // when webhook is received from Cloudinary
    const body = await request.json();
    
    // Validate webhook signature here if needed
    // For now, we'll just return success
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}