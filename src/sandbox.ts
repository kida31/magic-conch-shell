import { MagicEightBall, SillyChatBot, ChatGptTurbo} from "./applets/OpenAI/chatbot";


(async function () {
    console.log(await ChatGptTurbo.chat("I love this song.", "Dan"));
    console.log(await ChatGptTurbo.read("It's highway to hell!", "Dan"));
    console.log(await ChatGptTurbo.chat("Oh, who is the artist?", "Mark"));
    console.log(await ChatGptTurbo.chat("Give me the youtube link for this song.", "Mark"));
    console.log(await ChatGptTurbo.chat("Who are you talking to?", "TonyStark"));
    console.log(await ChatGptTurbo.chat("What did you send Mark?", "TonyStark"));
})();
