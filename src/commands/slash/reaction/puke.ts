import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "puke",
    description: "Puke on someone",
    query: "anime puke",
    messageWithPlaceholder: "**ACTOR** puke on **TARGET**",
});
