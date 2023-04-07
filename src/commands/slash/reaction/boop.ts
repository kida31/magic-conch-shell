import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "boop",
    description: "Boop someone",
    query: "anime boop",
    messageWithPlaceholder: "**ACTOR** booped **TARGET**",
});
