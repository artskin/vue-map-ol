export const DEV = process.env.NODE_ENV === 'development'
// export const BASE_REST_API_URL = DEV ? 'https://map.lausanne.ch/api' : '/api'
export const BASE_REST_API_URL = DEV ? 'https://mygolux.lausanne.ch/goapi/geo/' : '/goapi/geo/'
export const geoJSONUrl = DEV ? 'https://gomap.lausanne.ch/gomap-api/chantiers' : 'https://gomap.gil.town/gomap-api/chantiers'
