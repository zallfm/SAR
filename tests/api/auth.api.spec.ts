import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_API_ENDPOINTS } from '../fixtures/test-data';

/**
 * API Test Suite - Authentication
 * 
 * Tests for authentication API endpoints
 * Following Context7 best practices for API testing
 */

test.describe('API - Authentication', () => {
  const baseURL = 'http://localhost:3001';

  test('should login successfully with valid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('user');
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(responseBody).toHaveProperty('expiresIn');
    
    expect(responseBody.user.username).toBe(TEST_USERS.admin.username);
    expect(responseBody.user.role).toBe(TEST_USERS.admin.role);
  });

  test('should login successfully with DpH user credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.dph.username,
        password: TEST_USERS.dph.password
      }
    });

    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.user.username).toBe(TEST_USERS.dph.username);
    expect(responseBody.user.role).toBe(TEST_USERS.dph.role);
  });

  test('should login successfully with System Owner credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.systemOwner.username,
        password: TEST_USERS.systemOwner.password
      }
    });

    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.user.username).toBe(TEST_USERS.systemOwner.username);
    expect(responseBody.user.role).toBe(TEST_USERS.systemOwner.role);
  });

  test('should return 401 for invalid username', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: 'invaliduser',
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should return 401 for invalid password', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should return 400 for missing username', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Username is required');
  });

  test('should return 400 for missing password', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username
      }
    });

    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Password is required');
  });

  test('should return 400 for empty request body', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {}
    });

    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should return 400 for invalid request format', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: 'invalid json'
    });

    expect(response.status()).toBe(400);
  });

  test('should handle XSS attempts in username', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: '<script>alert("xss")</script>',
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should handle SQL injection attempts', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: "admin'; DROP TABLE users; --",
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should handle long username', async ({ request }) => {
    const longUsername = 'a'.repeat(1000);
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: longUsername,
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should handle long password', async ({ request }) => {
    const longPassword = 'a'.repeat(1000);
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: longPassword
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should handle special characters in credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: 'admin@test',
        password: 'pass@word123'
      }
    });

    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid username or password');
  });

  test('should return proper content type', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should return proper CORS headers', async ({ request }) => {
    const response = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password
      }
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
  });

  test('should handle rate limiting', async ({ request }) => {
    // Make multiple rapid requests
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
          data: {
            username: 'invaliduser',
            password: 'wrongpassword'
          }
        })
      );
    }

    const responses = await Promise.all(promises);
    
    // At least one should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('should handle concurrent login attempts', async ({ request }) => {
    // Make concurrent login requests with valid credentials
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
          data: {
            username: TEST_USERS.admin.username,
            password: TEST_USERS.admin.password
          }
        })
      );
    }

    const responses = await Promise.all(promises);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });

  test('should handle logout endpoint', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const token = loginBody.token;

    // Then logout
    const logoutResponse = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.logout}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(logoutResponse.status()).toBe(200);
  });

  test('should handle refresh token endpoint', async ({ request }) => {
    // First login to get tokens
    const loginResponse = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.login}`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    const refreshToken = loginBody.refreshToken;

    // Then refresh token
    const refreshResponse = await request.post(`${baseURL}${TEST_API_ENDPOINTS.auth.refresh}`, {
      data: {
        token: refreshToken
      }
    });

    expect(refreshResponse.status()).toBe(200);
    
    const refreshBody = await refreshResponse.json();
    expect(refreshBody).toHaveProperty('token');
    expect(refreshBody).toHaveProperty('refreshToken');
  });
});
