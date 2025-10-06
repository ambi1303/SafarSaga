import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/trips - Fetch all trips with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const destination = searchParams.get('destination')
    const difficulty = searchParams.get('difficulty')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isActive = searchParams.get('isActive') !== 'false' // Default to true
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('events')
      .select(`
        *,
        created_by_user:users!events_created_by_fkey(full_name, email)
      `)
      .eq('is_active', isActive)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (destination) {
      query = query.ilike('destination', `%${destination}%`)
    }
    
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty)
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    
    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trips' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      trips: data,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Trips API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create a new trip (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authorization' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Validate required fields
    const {
      name,
      description,
      destination,
      price,
      max_capacity,
      start_date,
      end_date,
      difficulty_level,
      itinerary,
      inclusions,
      exclusions,
      featured_image_url,
      gallery_images
    } = body

    if (!name || !destination || !price || !max_capacity || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create trip
    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        description,
        destination,
        price: parseFloat(price),
        max_capacity: parseInt(max_capacity),
        start_date,
        end_date,
        difficulty_level,
        itinerary,
        inclusions,
        exclusions,
        featured_image_url,
        gallery_images,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return NextResponse.json(
        { error: 'Failed to create trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trip: data }, { status: 201 })
  } catch (error) {
    console.error('Create trip API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}