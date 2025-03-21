/*
 * ChatGPT created.
 */
class HttpClient {
  constructor(baseUrl = '', defaultOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = defaultOptions;
  }

  async get(endpoint, options = {}) {
    const url = this._buildUrl(endpoint, options.params);
    return this._fetch(url, { method: 'GET', ...options });
  }

  _buildUrl(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
  }

  async _fetch(url, options) {
    const finalOptions = {
      headers: {
        'Accept': 'application/json',
        ...this.defaultOptions.headers,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, finalOptions);

    let data;
    try {
      data = await response.json();
    } catch (_) {
      data = { message: 'Invalid JSON response.' };
    }

    if (!response.ok) {
      const error = new Error(data.message || 'HTTP error');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }
}
