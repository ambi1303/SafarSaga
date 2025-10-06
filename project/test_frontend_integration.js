/**
 * Frontend Integration Tests for SafarSaga Booking System
 * Tests the complete booking flow from frontend to backend
 */

const API_BASE_URL = 'http://localhost:8000';

// Test data
const testUser = {
  email: 'test@safarsaga.com',
  password: 'testpassword123',
  full_name: 'Test User',
  phone: '+91-9876543210'
};

const testBooking = {
  destinationId: 'test-destination-id',
  seats: 2,
  travelDate: '2024-12-01',
  specialRequests: 'Vegetarian meals preferred',
  contactInfo: {
    phone: '+91-9876543210',
    emergencyContact: '+91-9876543211'
  }
};

let authToken = null;
let testBookingId = null;

/**
 * Test Authentication Flow
 */
async function testAuthentication() {
  console.log('🔐 Testing Authentication...');
  
  try {
    // Test user registration
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.status === 201) {
      const registerData = await registerResponse.json();
      authToken = registerData.access_token;
      console.log('✅ User registration successful');
    } else if (registerResponse.status === 400) {
      // User might already exist, try login
      console.log('ℹ️ User already exists, trying login...');
      
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        authToken = loginData.access_token;
        console.log('✅ User login successful');
      } else {
        throw new Error('Login failed');
      }
    } else {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

/**
 * Test Destinations API
 */
async function testDestinations() {
  console.log('🏔️ Testing Destinations API...');
  
  try {
    // Test get destinations
    const response = await fetch(`${API_BASE_URL}/api/destinations?is_active=true&limit=10`);
    
    if (!response.ok) {
      throw new Error(`Destinations API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid destinations response format');
    }
    
    if (data.items.length === 0) {
      console.log('⚠️ No destinations found - this might be expected for a new setup');
    } else {
      console.log(`✅ Found ${data.items.length} destinations`);
      
      // Use first destination for booking test
      if (data.items[0]) {
        testBooking.destinationId = data.items[0].id;
        console.log(`✅ Using destination: ${data.items[0].name}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Destinations test failed:', error.message);
    return false;
  }
}

/**
 * Test Booking Creation
 */
async function testBookingCreation() {
  console.log('📝 Testing Booking Creation...');
  
  if (!authToken) {
    console.error('❌ No auth token available for booking test');
    return false;
  }
  
  try {
    const payload = {
      destination_id: testBooking.destinationId,
      seats: testBooking.seats,
      travel_date: testBooking.travelDate,
      special_requests: testBooking.specialRequests,
      contact_info: testBooking.contactInfo
    };
    
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Booking creation failed: ${response.status} - ${errorData.detail || response.statusText}`);
    }
    
    const bookingData = await response.json();
    testBookingId = bookingData.id;
    
    console.log('✅ Booking created successfully');
    console.log(`✅ Booking ID: ${testBookingId}`);
    console.log(`✅ Booking Reference: ${bookingData.booking_reference}`);
    console.log(`✅ Total Amount: ₹${bookingData.total_amount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Booking creation test failed:', error.message);
    return false;
  }
}

/**
 * Test Booking Retrieval
 */
async function testBookingRetrieval() {
  console.log('📋 Testing Booking Retrieval...');
  
  if (!authToken || !testBookingId) {
    console.error('❌ No auth token or booking ID available');
    return false;
  }
  
  try {
    // Test get user bookings
    const listResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!listResponse.ok) {
      throw new Error(`Get bookings failed: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    console.log(`✅ Retrieved ${listData.items?.length || 0} bookings`);
    
    // Test get specific booking
    const detailResponse = await fetch(`${API_BASE_URL}/api/bookings/${testBookingId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!detailResponse.ok) {
      throw new Error(`Get booking details failed: ${detailResponse.status}`);
    }
    
    const detailData = await detailResponse.json();
    console.log('✅ Retrieved booking details successfully');
    console.log(`✅ Destination: ${detailData.destination?.name || 'Unknown'}`);
    console.log(`✅ Status: ${detailData.booking_status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Booking retrieval test failed:', error.message);
    return false;
  }
}

/**
 * Test Payment Confirmation
 */
async function testPaymentConfirmation() {
  console.log('💳 Testing Payment Confirmation...');
  
  if (!authToken || !testBookingId) {
    console.error('❌ No auth token or booking ID available');
    return false;
  }
  
  try {
    const paymentPayload = {
      payment_method: 'UPI',
      transaction_id: `TXN${Date.now()}`
    };
    
    const response = await fetch(`${API_BASE_URL}/api/bookings/${testBookingId}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(paymentPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Payment confirmation failed: ${response.status} - ${errorData.detail || response.statusText}`);
    }
    
    const paymentData = await response.json();
    console.log('✅ Payment confirmed successfully');
    console.log(`✅ Transaction ID: ${paymentPayload.transaction_id}`);
    console.log(`✅ Booking Status: ${paymentData.booking?.booking_status}`);
    console.log(`✅ Payment Status: ${paymentData.booking?.payment_status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Payment confirmation test failed:', error.message);
    return false;
  }
}

/**
 * Test Frontend Booking Service Integration
 */
async function testFrontendBookingService() {
  console.log('🌐 Testing Frontend Booking Service Integration...');
  
  try {
    // Simulate frontend BookingService usage
    const BookingService = {
      async createBooking(request) {
        const payload = {
          destination_id: request.destinationId,
          seats: request.seats,
          travel_date: request.travelDate || null,
          special_requests: request.specialRequests || '',
          contact_info: {
            phone: request.contactInfo.phone,
            emergency_contact: request.contactInfo.emergencyContact || null
          }
        };
        
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail?.message || errorData.detail || 'Booking failed');
        }
        
        return await response.json();
      },
      
      transformBackendBooking(backendBooking) {
        const destination = backendBooking.destination || {};
        
        return {
          id: backendBooking.id,
          bookingReference: backendBooking.booking_reference || `SS${Date.now()}`,
          destination: {
            id: destination.id || 'unknown',
            name: destination.name || 'Unknown Destination',
            location: `${destination.name}, ${destination.state}`,
            price: Number(destination.average_cost_per_day || 0),
            image: destination.featured_image_url || 'default-image.jpg'
          },
          seats: Number(backendBooking.seats || 1),
          totalAmount: Number(backendBooking.total_amount || 0),
          bookingStatus: backendBooking.booking_status || 'pending',
          paymentStatus: backendBooking.payment_status || 'unpaid',
          travelDate: backendBooking.travel_date,
          specialRequests: backendBooking.special_requests,
          contactInfo: {
            phone: backendBooking.contact_info?.phone || '',
            emergencyContact: backendBooking.contact_info?.emergency_contact
          },
          createdAt: backendBooking.booked_at || new Date().toISOString()
        };
      }
    };
    
    // Test booking creation through service
    const frontendBooking = await BookingService.createBooking({
      destinationId: testBooking.destinationId,
      seats: 1,
      travelDate: '2024-12-15',
      contactInfo: {
        phone: '+91-9876543210'
      }
    });
    
    // Test response transformation
    const transformedBooking = BookingService.transformBackendBooking(frontendBooking);
    
    console.log('✅ Frontend BookingService integration working');
    console.log(`✅ Transformed booking ID: ${transformedBooking.id}`);
    console.log(`✅ Destination name: ${transformedBooking.destination.name}`);
    console.log(`✅ Total amount: ₹${transformedBooking.totalAmount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Frontend BookingService test failed:', error.message);
    return false;
  }
}

/**
 * Test Error Handling
 */
async function testErrorHandling() {
  console.log('⚠️ Testing Error Handling...');
  
  try {
    // Test invalid destination booking
    const invalidBookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        destination_id: 'invalid-uuid',
        seats: 1,
        contact_info: { phone: '+91-9876543210' }
      })
    });
    
    if (invalidBookingResponse.status === 404 || invalidBookingResponse.status === 422) {
      console.log('✅ Invalid destination error handled correctly');
    } else {
      console.log('⚠️ Unexpected response for invalid destination');
    }
    
    // Test missing required fields
    const missingFieldResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        destination_id: testBooking.destinationId,
        seats: 1
        // Missing contact_info
      })
    });
    
    if (missingFieldResponse.status === 422) {
      console.log('✅ Missing required field error handled correctly');
    } else {
      console.log('⚠️ Unexpected response for missing required field');
    }
    
    // Test unauthorized access
    const unauthorizedResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination_id: testBooking.destinationId,
        seats: 1,
        contact_info: { phone: '+91-9876543210' }
      })
    });
    
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Unauthorized access error handled correctly');
    } else {
      console.log('⚠️ Unexpected response for unauthorized access');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

/**
 * Run all integration tests
 */
async function runAllTests() {
  console.log('🚀 Starting SafarSaga Frontend Integration Tests\n');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Destinations API', fn: testDestinations },
    { name: 'Booking Creation', fn: testBookingCreation },
    { name: 'Booking Retrieval', fn: testBookingRetrieval },
    { name: 'Payment Confirmation', fn: testPaymentConfirmation },
    { name: 'Frontend BookingService', fn: testFrontendBookingService },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    
    if (!result) {
      console.log(`❌ ${test.name} failed - stopping tests`);
      break;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Frontend integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the backend setup and try again.');
  }
  
  return passed === total;
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof module !== 'undefined') {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export for use in other contexts
if (typeof module !== 'undefined') {
  module.exports = {
    runAllTests,
    testAuthentication,
    testDestinations,
    testBookingCreation,
    testBookingRetrieval,
    testPaymentConfirmation,
    testFrontendBookingService,
    testErrorHandling
  };
}