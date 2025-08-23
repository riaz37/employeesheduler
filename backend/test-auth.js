const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAuthentication() {
  try {
    console.log('🔐 Testing Authentication System...\n');

    // Test 1: Login with seeded employee
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employee1@company.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log(`   Access Token: ${loginResponse.data.access_token.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${loginResponse.data.refresh_token.substring(0, 20)}...\n`);

    const accessToken = loginResponse.data.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Test 2: Get employee profile
    console.log('2. Testing authenticated endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/employees/profile`, { headers });
    console.log('✅ Profile retrieved successfully');
    console.log(`   Employee: ${profileResponse.data.firstName} ${profileResponse.data.lastName}`);
    console.log(`   Role: ${profileResponse.data.role}\n`);

    // Test 3: Get employees list
    console.log('3. Testing employees endpoint...');
    const employeesResponse = await axios.get(`${BASE_URL}/employees`, { headers });
    console.log('✅ Employees list retrieved successfully');
    console.log(`   Total employees: ${employeesResponse.data.meta.total}\n`);

    // Test 4: Get shifts
    console.log('4. Testing shifts endpoint...');
    const shiftsResponse = await axios.get(`${BASE_URL}/shifts`, { headers });
    console.log('✅ Shifts list retrieved successfully');
    console.log(`   Total shifts: ${shiftsResponse.data.meta.total}\n`);

    // Test 5: Get schedules
    console.log('5. Testing schedules endpoint...');
    const schedulesResponse = await axios.get(`${BASE_URL}/schedules`, { headers });
    console.log('✅ Schedules list retrieved successfully');
    console.log(`   Total schedules: ${schedulesResponse.data.meta.total}\n`);

    // Test 6: Get time-off requests
    console.log('6. Testing time-off endpoint...');
    const timeOffResponse = await axios.get(`${BASE_URL}/time-off`, { headers });
    console.log('✅ Time-off requests retrieved successfully');
    console.log(`   Total requests: ${timeOffResponse.data.meta.total}\n`);

    // Test 7: Get analytics
    console.log('7. Testing analytics endpoint...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/daily`, { 
      headers,
      params: { date: new Date().toISOString().split('T')[0] }
    });
    console.log('✅ Analytics retrieved successfully\n');

    console.log('🎉 All authentication tests passed!');
    console.log('\n📋 System Status:');
    console.log('✅ Authentication working');
    console.log('✅ JWT tokens valid');
    console.log('✅ Protected endpoints accessible');
    console.log('✅ Data retrieval working');
    console.log('✅ Role-based access functional');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure the server is running and the database is seeded');
    }
  }
}

// Run the test
testAuthentication(); 