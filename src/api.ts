import axios from 'axios';

const apiKey = process.env.TMDB_API_KEY;

const instance = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json',
    },
    params: {
        language: 'ko-KR',
        api_key: apiKey,
    },
});

export default instance;
