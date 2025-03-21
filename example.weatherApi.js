const weatherApi = new ApiService('http://apis.data.go.kr/1360000/AsosDalyInfoService/', {
  headers: {}
});

const weatherParams = {
  serviceKey: 'zKWRxiuWPmCTDfsHy4d07s9HF8Od1Sa1InjsGt5TZpr0mDFGQFFSDEopopBmuJ3d4wz089PBV%2FCDKuR3rkzOFw%3D%3D',
  pageNo: '1',
  numOfRows: '10',
  dataType: 'JSON',
  dataCd: 'ASOS',
  dateCd: 'DAY',
  startDt: '20240301',
  endDt: '20240301',
  stnIds: '108' // 서울
};

weatherApi.getWeatherData(weatherParams, { retries: 2 })
  .then(data => console.log('📊 기상 데이터:', data))
  .catch(err => console.error('⚠️ 에러:', err.message));
