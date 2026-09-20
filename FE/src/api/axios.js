import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (data?.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(e => e.message || e.errorMessage || e).join('\n');
      } else if (data?.error?.message) {
        errorMessage = data.error.message;
      } else if (data?.title) {
        errorMessage = data.title;
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the server. Please check your network connection.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;
