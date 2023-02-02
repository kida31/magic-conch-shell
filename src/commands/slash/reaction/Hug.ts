import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "hug",
    description: "Hug someone",
    query: "anime hug",
    messageWithPlaceholder: "**ACTOR** hugged **TARGET**",
});
