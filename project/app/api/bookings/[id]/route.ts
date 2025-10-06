import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// GET /api/bookings/[id] - Proxy to FastAPI backend
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth header from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    console.log('Proxying GET request for booking:', params.id)

    // Forward request to FastAPI backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/bookings/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.detail || data.error || 'Backend request failed' },
        { status: backendResponse.status }
      )
    }

    console.log('Backend response successful for booking:', params.id)
    return NextResponse.json(data, { status: backendResponse.status })

  } catch (error) {
    console.error('Proxy error in GET /api/bookings/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Proxy to FastAPI backend
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Get auth header from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    console.log('Proxying PUT request for booking:', params.id, 'with body:', body)

    // Forward request to FastAPI backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/bookings/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.detail || data.error || 'Backend request failed' },
        { status: backendResponse.status }
      )
    }

    console.log('Backend update successful for booking:', params.id)
    return NextResponse.json(data, { status: backendResponse.status })

  } catch (error) {
    console.error('Proxy error in PUT /api/bookings/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Proxy to FastAPI backend
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth header from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    console.log('Proxying DELETE request for booking:', params.id)

    // Forward request to FastAPI backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/bookings/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    // Handle 204 No Content response (successful cancellation)
    if (backendResponse.status === 204) {
      console.log('Backend cancellation successful for booking:', params.id)
      return new NextResponse(null, { status: 204 })
    }

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error('Backend error:', data)
      return NextResponse.json(
        { error: data.detail || data.error || 'Backend request failed' },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(data, { status: backendResponse.status })

  } catch (error) {
    console.error('Proxy error in DELETE /api/bookings/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}