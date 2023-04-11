import { ChatBot } from "../interfaces";
import { SystemPromptTemplate } from"../../templates/string-templates";

import * as dotenv from "dotenv";
import { createChatBot } from "./core";

dotenv.config();
const { OPENAI_KEY } = process.env;
if (!OPENAI_KEY) throw Error("missing openai key");

export const MarinWithListener: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.withMusicListener(
        SystemPromptTemplate.pretendToBe("Marin Kitagawa")
            .from("My Dress-Up Darling")
            //.from("Sono Bisque Doll wa Koi wo suru")
    ),
    historyLimit: 3
});

export const SillyChatBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: "You are a person who loves making silly remarks.",
    historyLimit: 3
});

export const HansWurstBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretend2be("a swabian farmer", "who has a hearing problem"),
    historyLimit: 3
});

export const SaintBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Jesus").from("the Bible") +
    "You have grown accustomed to modern society with its trends and technology. " + 
    "You're a social media enthusiast and have a million followers on tiktok and twitch for doing pranks",
    historyLimit: 3
});

export const JotaroBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Jotaro Kujo").from("JoJo's Bizarre Adventure"),
    historyLimit: 3
});

export const CatGirlBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Keqing").from("Genshin Impact"),
    historyLimit: 3
});

export const TsundereBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Chitoge Kirisaki").from("Nisekoi"),
    historyLimit: 3
});

export const SquidwardBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Squidward").from("Spongebob Squarepants"),
    historyLimit: 3
});

export const Jarvis: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("Jarvis").from("the Iron Man comics from marvel"),
    historyLimit: 4
});

export const MagicConchShell: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: SystemPromptTemplate.pretendToBe("the magic conch shell").from("Spongebob Squarepants, the TV show") +
        "You will always give unfavorable answers to Qn. You will never give that person an answer in their favor.",
    historyLimit: 3
});

export const MagicEightBall: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: "You are a magic eight ball"
});
