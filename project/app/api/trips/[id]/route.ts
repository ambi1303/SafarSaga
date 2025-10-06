import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/trips/[id] - Fetch single trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        created_by_user:users!events_created_by_fkey(full_name, email),
        bookings:tickets(
          id,
          seats,
          booking_status,
          payment_status,
          user:users(full_name, email)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching trip:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error('Trip API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/trips/[id] - Update trip (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update trip
    const { data, error } = await supabase
      .from('events')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }
      console.error('Error updating trip:', error)
      return NextResponse.json(
        { error: 'Failed to update trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error('Update trip API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/[id] - Delete trip (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Check if trip has bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('tickets')
      .select('id')
      .eq('event_id', params.id)
      .eq('booking_status', 'confirmed')

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to check bookings' },
        { status: 500 }
      )
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete trip with confirmed bookings' },
        { status: 400 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }
      console.error('Error deleting trip:', error)
      return NextResponse.json(
        { error: 'Failed to delete trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Delete trip API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}