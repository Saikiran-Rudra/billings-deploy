/**
 * Diagnostics utility for debugging API issues
 */

export const Diagnostics = {
  /**
   * Check authentication status
   */
  checkAuth: () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    console.log('%c🔐 AUTH DIAGNOSTICS', 'color: blue; font-weight: bold; font-size: 14px');
    console.log(`✓ Token exists: ${!!token}`);
    console.log(`✓ Token length: ${token?.length || 0}`);
    console.log(`✓ Token preview: ${token ? token.substring(0, 20) + '...' : 'N/A'}`);
    console.log(`✓ API URL: ${apiUrl}`);

    return { token: !!token, tokenValid: token?.length || 0 > 10, apiUrl };
  },

  /**
   * Log API request details
   */
  logApiCall: (endpoint: string, method: string = 'GET', data?: unknown) => {
    console.log('%c📡 API CALL', 'color: green; font-weight: bold; font-size: 12px');
    console.log(`Method: ${method}`);
    console.log(`Endpoint: ${endpoint}`);
    if (data) console.log(`Data:`, data);
    console.log(`URL: ${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
  },

  /**
   * Test API connectivity
   */
  testApiConnectivity: async () => {
    try {
      console.log('%c🧪 TESTING API CONNECTIVITY', 'color: purple; font-weight: bold; font-size: 12px');

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        console.error('❌ No authentication token found!');
        return { connected: false, reason: 'No token' };
      }

      const response = await fetch(`${apiUrl}/stock/list?page=1&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`✓ Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('❌ API Error:', error);
        return { connected: false, status: response.status, error };
      }

      const data = await response.json();
      console.log('✓ Success! Response:', data);
      return { connected: true, status: response.status, data };
    } catch (error) {
      console.error('%c❌ CONNECTIVITY TEST FAILED', 'color: red; font-weight: bold');
      console.error(error);
      return { connected: false, reason: String(error) };
    }
  },

  /**
   * Generate diagnostics report
   */
  generateReport: async () => {
    console.clear();
    console.log('%c═══════════════════════════════════════', 'color: cyan; font-weight: bold');
    console.log('%c📋 HISAAB KITAAB DIAGNOSTICS REPORT', 'color: cyan; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════', 'color: cyan; font-weight: bold');

    const auth = Diagnostics.checkAuth();
    const connectivity = await Diagnostics.testApiConnectivity();

    console.log('%c📊 SUMMARY', 'color: orange; font-weight: bold');
    console.log(`Auth Valid: ${auth?.tokenValid ? '✓ YES' : '❌ NO'}`);
    console.log(`API Connected: ${connectivity.connected ? '✓ YES' : '❌ NO'}`);

    if (!auth?.tokenValid) {
      console.log('%c⚠️ ACTION REQUIRED', 'color: red; font-weight: bold');
      console.log('Your authentication token is missing or invalid. Please log in again.');
    }

    if (!connectivity.connected) {
      console.log('%c⚠️ ACTION REQUIRED', 'color: red; font-weight: bold');
      console.log('Cannot reach the backend API. Verify:');
      console.log('1. Backend server is running on port 5000');
      console.log('2. API_URL environment variable is correct');
      console.log('3. Check Network tab for CORS errors');
    }
  },
};

// Expose to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).Diagnostics = Diagnostics;
}
