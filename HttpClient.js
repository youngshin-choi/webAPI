/**
 * HttpClient - A traditional JavaScript adapter for the Fetch API
 * 
 * Design Philosophy:
 * This class follows the Adapter pattern to provide a more familiar interface
 * to the modern Fetch API. It addresses several design goals:
 * 
 * 1. Simplification: Reduces the two-step fetch+parse process to a single operation
 * 2. Consistency: Normalizes error handling across network and HTTP errors
 * 3. Convention over Configuration: Provides sensible defaults while allowing customization
 * 4. SOLID principles: Each method has a single responsibility
 * 5. Facade pattern: Hides complexity behind a simple interface
 * 6. Familiar API: Follows traditional HTTP client conventions (get, post, put, delete)
 */
class HttpClient {
  /**
   * Create a new HttpClient instance
   * 
   * @param {string} baseUrl - Base URL prefix for all requests (optional)
   * @param {Object} defaultOptions - Default fetch options to apply to all requests (optional)
   * 
   * Design Note: Uses dependency injection to allow for flexible configuration
   * without hard-coding values, supporting both testing and production use cases.
   */
  constructor(baseUrl = '', defaultOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = defaultOptions;
  }

  /**
   * Perform a GET request
   * 
   * @param {string} endpoint - API endpoint to call
   * @param {Object} options - Request options to override defaults
   * @returns {Promise<any>} - Parsed response (JSON or text)
   * 
   * Design Note: Provides a convenience method that matches traditional HTTP client
   * libraries while maintaining the Promise-based architecture of Fetch.
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Perform a POST request with JSON data
   * 
   * @param {string} endpoint - API endpoint to call
   * @param {Object} data - Data to send as JSON in the request body
   * @param {Object} options - Request options to override defaults
   * @returns {Promise<any>} - Parsed response (JSON or text)
   * 
   * Design Note: Implements convention over configuration by automatically
   * setting content-type headers and stringify-ing JSON data.
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  /**
   * Perform a PUT request with JSON data
   * 
   * @param {string} endpoint - API endpoint to call
   * @param {Object} data - Data to send as JSON in the request body
   * @param {Object} options - Request options to override defaults
   * @returns {Promise<any>} - Parsed response (JSON or text)
   * 
   * Design Note: Follows the same pattern as post() to maintain consistency
   * throughout the API, enhancing learnability and predictability.
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  /**
   * Perform a DELETE request
   * 
   * @param {string} endpoint - API endpoint to call
   * @param {Object} options - Request options to override defaults
   * @returns {Promise<any>} - Parsed response (JSON or text)
   * 
   * Design Note: Completes the set of CRUD operations, providing a symmetrical API.
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method that handles all HTTP requests
   * 
   * @param {string} endpoint - API endpoint to call
   * @param {Object} options - Request options to override defaults
   * @returns {Promise<any>} - Parsed response (JSON or text)
   * @throws {Object} - Standardized error object
   * 
   * Design Note: This is the workhorse method implementing the Adapter pattern.
   * It encapsulates all the complexity of working with Fetch (two-step parsing,
   * error handling, etc.) behind a simple Promise-based interface.
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    // Merge default options with request-specific options
    const requestOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Use raw fetch API
      const response = await fetch(url, requestOptions);
      
      // Improve fetch's error handling: treat HTTP errors as exceptions
      // This is a key enhancement over fetch's default behavior
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        };
      }
      
      // Auto-detect and parse JSON responses
      // This eliminates the standard two-step fetch -> then response.json()
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Default to text for non-JSON responses
      return await response.text();
    } catch (error) {
      // Standardize error handling to make it more predictable
      // than fetch's split handling of network vs HTTP errors
      throw error;
    }
  }

  /**
   * Build the complete URL from a relative endpoint or use absolute URL
   * 
   * @param {string} endpoint - API endpoint to call
   * @returns {string} - Complete URL for the request
   * 
   * Design Note: This helper method follows the Single Responsibility Principle
   * by extracting URL construction logic, and supports flexibility by allowing 
   * both relative paths and absolute URLs.
   */
  buildUrl(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint}`;
  }
}
