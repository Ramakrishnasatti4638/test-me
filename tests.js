const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'manual', // Don't follow redirects automatically
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting URL Shortener Tests...\n');

  let testsPassed = 0;
  let testsFailed = 0;
  const results = [];

  try {
    // Test 1: Create a short URL
    console.log('Test 1: Create a short URL');
    const longUrl = 'https://www.example.com/very/long/path/to/some/resource?param1=value1&param2=value2';
    const createResponse = await makeRequest('POST', '/api/shorten', { url: longUrl });

    assert.strictEqual(
      createResponse.status,
      200,
      `Expected status 200, got ${createResponse.status}`
    );

    const createData = JSON.parse(createResponse.body);
    assert(createData.shortUrl, 'Short URL should be present in response');
    assert(createData.shortCode, 'Short code should be present in response');
    assert.strictEqual(createData.originalUrl, longUrl, 'Original URL should match input');

    const shortCode = createData.shortCode;
    const shortUrl = createData.shortUrl;

    console.log('✓ Test 1 passed: Short URL created successfully');
    console.log(`  Short URL: ${shortUrl}\n`);
    testsPassed++;
    results.push({
      name: 'Create a short URL',
      passed: true,
      result: `Short URL created: ${shortUrl}`,
    });

    // Test 2: Verify redirect URL info
    console.log('Test 2: Verify redirect URL info via API');
    const redirectInfoResponse = await makeRequest('GET', `/api/redirect/${shortCode}`);

    assert.strictEqual(
      redirectInfoResponse.status,
      200,
      `Expected status 200, got ${redirectInfoResponse.status}`
    );

    const redirectData = JSON.parse(redirectInfoResponse.body);
    assert.strictEqual(
      redirectData.originalUrl,
      longUrl,
      'Original URL should match from database'
    );

    console.log('✓ Test 2 passed: Redirect info verified');
    console.log(`  Original URL: ${redirectData.originalUrl}\n`);
    testsPassed++;
    results.push({
      name: 'Verify redirect URL info',
      passed: true,
      result: 'Redirect info verified correctly',
    });

    // Test 3: Test redirect endpoint (most important for our requirement)
    console.log('Test 3: Test redirect endpoint - click on link and it redirects');
    const redirectResponse = await makeRequest('GET', `/s/${shortCode}`);

    // Should return 301 or 302 status for redirect
    assert(
      redirectResponse.status === 301 || redirectResponse.status === 302 || redirectResponse.status === 307,
      `Expected redirect status (301, 302, or 307), got ${redirectResponse.status}`
    );

    assert(
      redirectResponse.headers.location,
      'Location header should be present for redirect'
    );

    assert.strictEqual(
      redirectResponse.headers.location,
      longUrl,
      `Location should redirect to original URL: ${longUrl}`
    );

    console.log('✓ Test 3 passed: Redirect works correctly');
    console.log(`  Status: ${redirectResponse.status}`);
    console.log(`  Location: ${redirectResponse.headers.location}\n`);
    testsPassed++;
    results.push({
      name: 'Test redirect - click on link redirects to original URL',
      passed: true,
      result: `Redirect successful (HTTP ${redirectResponse.status}) to original URL`,
    });

    // Test 4: Invalid URL should fail
    console.log('Test 4: Invalid URL should return error');
    const invalidResponse = await makeRequest('POST', '/api/shorten', { url: 'not-a-valid-url' });

    assert.strictEqual(
      invalidResponse.status,
      400,
      `Expected status 400, got ${invalidResponse.status}`
    );

    console.log('✓ Test 4 passed: Invalid URL rejected\n');
    testsPassed++;
    results.push({
      name: 'Invalid URL handling',
      passed: true,
      result: 'Invalid URL properly rejected',
    });

    // Test 5: Non-existent short code should return 404
    console.log('Test 5: Non-existent short code should return 404');
    const notFoundResponse = await makeRequest('GET', `/api/redirect/nonexistent123`);

    assert.strictEqual(
      notFoundResponse.status,
      404,
      `Expected status 404, got ${notFoundResponse.status}`
    );

    console.log('✓ Test 5 passed: Non-existent short code returns 404\n');
    testsPassed++;
    results.push({
      name: 'Non-existent short code handling',
      passed: true,
      result: 'Non-existent code properly returns 404',
    });

    // Test 6: Create multiple URLs and verify they don't conflict
    console.log('Test 6: Create multiple URLs and verify no conflicts');
    const url2 = 'https://github.com/octocat/Hello-World';
    const url3 = 'https://stackoverflow.com/questions/123456';

    const create2 = await makeRequest('POST', '/api/shorten', { url: url2 });
    const create3 = await makeRequest('POST', '/api/shorten', { url: url3 });

    const data2 = JSON.parse(create2.body);
    const data3 = JSON.parse(create3.body);

    assert.notStrictEqual(
      data2.shortCode,
      data3.shortCode,
      'Different URLs should have different short codes'
    );

    // Verify first URL still works
    const verify1 = await makeRequest('GET', `/api/redirect/${shortCode}`);
    const verifyData1 = JSON.parse(verify1.body);
    assert.strictEqual(verifyData1.originalUrl, longUrl, 'First URL should still resolve correctly');

    // Verify second URL works
    const verify2 = await makeRequest('GET', `/api/redirect/${data2.shortCode}`);
    const verifyData2 = JSON.parse(verify2.body);
    assert.strictEqual(verifyData2.originalUrl, url2, 'Second URL should resolve correctly');

    console.log('✓ Test 6 passed: Multiple URLs managed correctly\n');
    testsPassed++;
    results.push({
      name: 'Multiple URL management',
      passed: true,
      result: 'Multiple URLs stored and retrieved independently',
    });
  } catch (err) {
    console.error('✗ Test failed:', err.message);
    testsFailed++;
    results.push({
      name: 'Test error',
      passed: false,
      result: err.message,
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log('='.repeat(60) + '\n');

  return {
    passed: testsPassed,
    failed: testsFailed,
    results,
  };
}

// Run tests
runTests().catch(console.error);
