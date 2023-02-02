import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "slap",
    description: "Slap someone",
    query: "anime slap",
    messageWithPlaceholder: "**ACTOR** slapped **TARGET**",
});
