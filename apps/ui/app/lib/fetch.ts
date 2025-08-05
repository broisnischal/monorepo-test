import { up } from 'up-fetch'

// Get API URL from environment or use fallback
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        return '/api'
    }

    return process.env.NODE_ENV === "production" ? process.env.API_URL! : 'http://localhost:4000/api'
}

export const upfetch = up(fetch, () => ({
    baseUrl: getApiUrl(),
    timeout: 30000,
})); 