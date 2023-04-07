import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "pat",
    description: "Pat someone",
    query: "anime pat",
    messageWithPlaceholder: "**ACTOR** patted **TARGET**",
});
