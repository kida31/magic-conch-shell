const {request} = require('undici')
const BASE_URL = 'https://api.giphy.com/v1/gifs/'
const SEARCH_URL = BASE_URL + 'search'
const RANDOM_URL = BASE_URL + 'random'

let apiKey = null;

module.exports = {
    setKey:
        function (value) {
            console.log("Giphy: Set API Key")
            apiKey = value;
        },
    async search(query = null, limit = 25, offset = 0, rating = 'g', lang = 'en', render = 'downsized') {
        if (apiKey == null || query == null) throw new Error("API Key and Query are required")
        const url = `${SEARCH_URL}?api_key=${apiKey}&q=${query}&limit=${limit}&offset=${offset}&rating=${rating}&lang=${lang}`
        const response = await request(url);
        const json = await response.body.json();
        return json.data;
    }
}


