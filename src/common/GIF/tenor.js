const {request} = require('undici')
const URL = 'https://tenor.googleapis.com/v2/search?'


let apiKey = null;

module.exports = {
    setup(aKey) {
        console.log("Tenor: Set API Key")
        apiKey = aKey;
    },
    async search(parameters) {
        checkSetup();
        if (!('q' in parameters)) throw new Error("Query needs to be defined");
        if (!('client_key' in parameters)) parameters['client_key'] = "TenorDefault";
        if (!('key' in parameters)) parameters['key'] = apiKey;

        const paramString = Object.keys(parameters)
            .map(p => {
                const pruned = String(parameters[p]).split(' ').join('+');
                return `${p}=${pruned}`
            })
            .join('&')

        console.log(URL + paramString);
        const response = await request(URL + paramString);
        const json =  await response.body.json()
        return json.results;
    }
}

function checkSetup() {
    if (apiKey == null) throw new Error("API Key has not been set yet");
}