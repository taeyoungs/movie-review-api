import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json',
    },
    params: {
        language: 'ko-KR',
        api_key: process.env.TMDB_API_KEY,
    },
});

interface ICredentials {
    client_id: string | undefined;
    client_secret: string | undefined;
    code: string;
    grant_type?: string;
    redirect_uri?: string;
}

export const getGithubToken = async (code: string) => {
    const credentials: ICredentials = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
    };
    return await axios({
        method: 'POST',
        url: 'https://github.com/login/oauth/access_token',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        data: credentials,
    })
        .then((res) => res.data)
        .catch((error) => console.warn(error.status, error.statusText));
};

export const getGithubUser = async (token: string) => {
    return await axios({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
            Authorization: `token ${token}`,
        },
    })
        .then((res) => res.data)
        .catch((error) => console.warn(error.status, error.statusText));
};

export const getGoogleToken = async (code: string) => {
    const credentials: ICredentials = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://localhost:3000/code',
    };
    const result = await axios({
        method: 'POST',
        url: `https://oauth2.googleapis.com/token?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}&code=${credentials.code}&grant_type=authorization_code&redirect_uri=https://localhost:3000/code`,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });

    return result.data;
};

export const getGoogleUser = async (token: string) => {
    console.log(token);
    const result = await axios({
        method: 'GET',
        url: 'https://www.googleapis.com/userinfo/v2/me',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log(result);
    return result.data;
};

export default instance;
