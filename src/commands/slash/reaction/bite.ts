import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "bite",
    description: "Bite someone",
    query: "anime bite",
    messageWithPlaceholder: "**ACTOR** bites **TARGET**",
});
