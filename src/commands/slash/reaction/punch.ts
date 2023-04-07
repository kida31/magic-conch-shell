import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "punch",
    description: "Punch someone",
    query: "anime punch",
    messageWithPlaceholder: "**ACTOR** punched **TARGET**",
});
