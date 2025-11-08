import axios from 'axios';

// Set global axios defaults - affects ALL axios calls in your app
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

export default axios;