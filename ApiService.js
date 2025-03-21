class ApiService {
  constructor(baseUrl, defaultOptions = {}) {
    this.client = new HttpClient(baseUrl, defaultOptions);
  }

  async request(requestFn, {
    retries = 1,
    retryDelay = 1000,
    errorMessage = 'API request failed.',
    transformResponse = d => d,
    validateStatus = null
  } = {}) {
    let attempts = 0;

    const tryRequest = async () => {
      try {
        const res = await requestFn();

        if (validateStatus && !validateStatus(res)) {
          throw new Error('Custom validation failed.');
        }

        return transformResponse(res);
      } catch (err) {
        if (attempts < retries) {
          attempts++;
          await new Promise(res => setTimeout(res, retryDelay));
          return tryRequest();
        }

        const message = err.status
          ? this.getErrorMessageByStatus(err.status, errorMessage)
          : errorMessage;

        const enhanced = new Error(message);
        enhanced.originalError = err;
        throw enhanced;
      }
    };

    return tryRequest();
  }

  getErrorMessageByStatus(status, fallback) {
    const messages = {
      400: '잘못된 요청입니다.',
      401: '인증이 필요합니다.',
      403: '접근이 거부되었습니다.',
      404: '데이터를 찾을 수 없습니다.',
      429: '요청이 너무 많습니다. 나중에 다시 시도하세요.',
      500: '서버 오류가 발생했습니다.',
    };
    return messages[status] || fallback;
  }

  async getWeatherData(params, options = {}) {
    return this.request(
      () => this.client.get('getWthrDataList', { params }),
      {
        errorMessage: '기상 데이터 조회에 실패했습니다.',
        transformResponse: res => res.response?.body?.items?.item || [],
        ...options
      }
    );
  }
}
