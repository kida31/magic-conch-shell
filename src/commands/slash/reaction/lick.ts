import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "lick",
    description: "Lick someone",
    query: "anime lick",
    messageWithPlaceholder: "**ACTOR** licked **TARGET**",
});
