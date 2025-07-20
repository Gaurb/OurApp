import axios from 'axios';
import { host } from './APIRoutes';

const axiosInstance = axios.create({
    baseURL: `${host}`,
    withCredentials: true
});

// Add request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Request being sent:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// Function to set auth token
export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Headers after setting:', axiosInstance.defaults.headers.common);
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
        console.log('Headers after deletion:', axiosInstance.defaults.headers.common);
    }
};

export default axiosInstance; 