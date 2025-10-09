import { NextRequest, NextResponse } from 'next/server';

// Static gallery data from actual gallery albums only
const staticGalleryData = [
  {
    id: 'manali-kasol-1',
    url: '/images/gallery/manali-kasol.JPG',
    title: 'Manali Kasol Adventures',
    altText: 'Beautiful mountain landscape from Manali Kasol adventure tour',
    description: 'Stunning mountain views captured during our Manali Kasol adventure tour',
    destination: 'Manali Kasol',
    tags: ['manali', 'kasol', 'adventure', 'mountains']
  },
  {
    id: 'chopta-1',
    url: '/images/gallery/chopta-1.JPG',
    title: 'Chopta Mountain Views',
    altText: 'Breathtaking mountain views from Chopta trekking expedition',
    description: 'Breathtaking mountain views from our Chopta trekking expedition',
    destination: 'Chopta',
    tags: ['chopta', 'mountains', 'trekking', 'himalaya']
  },
  {
    id: 'jibhi-1',
    url: '/images/gallery/jibli.JPG',
    title: 'Jibhi Forest Trails',
    altText: 'Serene forest trails in Jibhi nature walk',
    description: 'Serene forest trails discovered during our Jibhi nature walk',
    destination: 'Jibhi',
    tags: ['jibhi', 'forest', 'nature', 'himachal']
  },
  {
    id: 'chakrata-1',
    url: '/images/gallery/chakrata.JPG',
    title: 'Chakrata Hill Station',
    altText: 'Scenic beauty of Chakrata hill station',
    description: 'Scenic beauty of Chakrata hill station during our weekend getaway',
    destination: 'Chakrata',
    tags: ['chakrata', 'hills', 'scenic', 'uttarakhand']
  },
  {
    id: 'manali-2',
    url: '/images/gallery/manali.JPG',
    title: 'Manali Snow Adventures',
    altText: 'Snow-covered landscapes in Manali adventure tour',
    description: 'Snow-covered landscapes from our thrilling Manali adventure tour',
    destination: 'Manali',
    tags: ['manali', 'snow', 'adventure', 'winter']
  },
  {
    id: 'chopta-2',
    url: '/images/gallery/chopta2.JPG',
    title: 'Chopta Meadows',
    altText: 'Lush green meadows of Chopta valley',
    description: 'Lush green meadows of Chopta valley in full bloom',
    destination: 'Chopta',
    tags: ['chopta', 'meadows', 'nature', 'green']
  },
  {
    id: 'chopta-3',
    url: '/images/gallery/chopta3.JPG',
    title: 'Chopta Valley Views',
    altText: 'Panoramic valley views from Chopta',
    description: 'Spectacular panoramic views of the Chopta valley and surrounding peaks',
    destination: 'Chopta',
    tags: ['chopta', 'valley', 'panoramic', 'peaks']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const tags = searchParams.get('tags')?.split(',') || [];
    const maxResults = parseInt(searchParams.get('maxResults') || '12');
    const query = searchParams.get('query');

    let filteredImages = [...staticGalleryData];

    // Filter by tags if provided
    if (tags.length > 0) {
      filteredImages = filteredImages.filter(image => 
        tags.some(tag => image.tags.includes(tag.toLowerCase()))
      );
    }

    // Filter by search query if provided
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredImages = filteredImages.filter(image =>
        image.title.toLowerCase().includes(searchTerm) ||
        image.description.toLowerCase().includes(searchTerm) ||
        image.destination.toLowerCase().includes(searchTerm) ||
        image.tags.some(tag => tag.includes(searchTerm))
      );
    }

    // Limit results
    const images = filteredImages.slice(0, maxResults);

    return NextResponse.json({
      images,
      nextCursor: null, // No pagination for static data
      totalCount: filteredImages.length
    });
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