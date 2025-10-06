import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// GET /api/bookings - Proxy to FastAPI backend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get auth header from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Build query parameters for backend
    const backendUrl = new URL(`${BACKEND_API_URL}/api/bookings`)
    
    // Forward query parameters to backend
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value)
    })

    console.log('Proxying GET request to backend:', backendUrl.toString())

    // Forward request to FastAPI backend
    const backendResponse = await fetch(backendUrl.toString(), {
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

    console.log('Backend response successful, returning data')
    return NextResponse.json(data, { status: backendResponse.status })

  } catch (error) {
    console.error('Proxy error in GET /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Proxy to FastAPI backend
export async function POST(request: NextRequest) {
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

    console.log('Proxying POST request to backend with body:', body)

    // Forward request to FastAPI backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/bookings`, {
      method: 'POST',
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

    console.log('Backend booking creation successful')
    return NextResponse.json(data, { status: backendResponse.status })

  } catch (error) {
    console.error('Proxy error in POST /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}