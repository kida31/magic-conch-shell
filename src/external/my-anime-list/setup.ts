/**
 * Utility to setup authentication token. Public information does not require this.
 */
import axios, { AxiosResponse } from "axios";
import querystring from 'querystring';


const { MAL_CLIENT_ID, MAL_CLIENT_SECRET, MAL_CODE_CHALLENGE, MAL_AUTH_CODE } = process.env;
const MAL_CODE_VERIFIER = MAL_CODE_CHALLENGE;


function showUserAuthUrl() {
    const url = "https://myanimelist.net/v1/oauth2/authorize?";
    const getParams = {
        response_type: "code",
        client_id: MAL_CLIENT_ID,
        code_challenge: MAL_CODE_CHALLENGE,
        state: "conch420",
    }

    const urlWithParams = url + [...Object.entries(getParams).map(([key, value]) => key + "=" + value)].join("&");
    console.log(urlWithParams);
}

async function getToken(): Promise<{}> {
    const url = "https://myanimelist.net/v1/oauth2/token"
    const postData = {
        client_id: MAL_CLIENT_ID,
        client_secret: MAL_CLIENT_SECRET,
        code: MAL_AUTH_CODE,
        code_verifier: MAL_CODE_VERIFIER,
        grant_type: "authorization_code"
    }
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    try {
        const response = await axios.post(url, querystring.stringify(postData), config);
        console.log("Response " + response.status);
        console.log(JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.log(`HTTP Request Error: ${error}`);
        throw error;
    }
}

(async function main() {
    try {
        const token = await getToken();
        console.log("Please add the access and refresh token to your env");
        console.log(token);
    } catch (error) {
        console.log("AUTH_CODE outdated.")
        showUserAuthUrl();
        console.log("Paste the code in the redirect url to env");
        return 0;
    }
})();


