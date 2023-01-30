import { quickRandomSearch, search } from "./applets/Tenor/Tenor";
import { GifFormat, GifObject, SearchOptions, TenorResponse, } from "./applets/Tenor/Types";

(async () => {
    console.log(await quickRandomSearch({ q: "cat girl" }));
    console.log(await quickRandomSearch({ q: "cat girl", media_filter: [GifFormat.mp4] }));
    console.log(await quickRandomSearch({ q: "cat girl" }));
    console.log(await quickRandomSearch({ q: "cat girl" }));
})()
