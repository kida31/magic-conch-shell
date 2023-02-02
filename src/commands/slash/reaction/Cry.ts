import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "cry",
    description: "Cry to someone",
    query: "anime cry",
    messageWithPlaceholder: "**ACTOR** is crying",
});
