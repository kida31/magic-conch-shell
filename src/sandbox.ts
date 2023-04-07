import { MagicEightBall, SillyChatBot, CustomAIBot} from "./applets/OpenAI/chatbot";


(async function () {
    console.log(await CustomAIBot.chat("I love this song.", "Dan"));
    console.log(await CustomAIBot.read("It's highway to hell!", "Dan"));
    console.log(await CustomAIBot.chat("Oh, who is the artist?", "Mark"));
    console.log(await CustomAIBot.chat("Give me the youtube link for this song.", "Mark"));
    console.log(await CustomAIBot.chat("Who are you talking to?", "TonyStark"));
    console.log(await CustomAIBot.chat("What did you send Mark?", "TonyStark"));
})();
