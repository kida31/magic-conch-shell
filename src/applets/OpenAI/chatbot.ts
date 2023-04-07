import { Configuration, OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { ChatBot } from "../interfaces";
import { ChildLogger } from "../../common/logger";
import { pretendToBe } from"./util";

import * as dotenv from "dotenv";

dotenv.config();
const { OPENAI_KEY } = process.env;
if (!OPENAI_KEY) throw Error("missing openai key");

type BotOption = {
    systemMeta?: string,
    historyLimit?: number
    max_tokens?: number,
    model?: string
}

const ChatMessage = {
    asAssistant: (message: string): ChatCompletionRequestMessage => ({ role: "assistant", content: message }),
    asSystem: (message: string): ChatCompletionRequestMessage => ({ role: "system", content: message }),
    asUser: (message: string, name?: string): ChatCompletionRequestMessage => ({
        role: "user",
        content: message,
        name: name
    }),
}

export function createChatBot(key: string, options?: BotOption): ChatBot {
    const logger = ChildLogger("ChatBot");

    const openAiApi: OpenAIApi = new OpenAIApi(new Configuration({ apiKey: key }));
    let history: ChatCompletionRequestMessage[] = [];

    const MODEL = options?.model ?? "gpt-3.5-turbo";
    const HISTORY_LIMIT = (options?.historyLimit ?? 0) * 2;
    const MAX_TOKENS = options?.max_tokens ?? 200;

    function addToHistory(msg: ChatCompletionRequestMessage) {
        if (HISTORY_LIMIT > 0) {
            history.push(msg);
            if (HISTORY_LIMIT < history.length) {
                history = history.slice(history.length - HISTORY_LIMIT);
            }
        }
    }

    async function read(text: string, username?: string): Promise<void> {
        logger.info(`Read "${text}" - ${username}`);
        addToHistory(ChatMessage.asUser(text, username));
    }

    async function chat(text: string, username?: string): Promise<string | undefined> {
        await read(text, username);

        const messages = [];
        if (options?.systemMeta) {
            messages.push(ChatMessage.asSystem(options.systemMeta));
        }
        messages.push(...history);
        logger.log("trace", messages);

        try {
            const httpResponse = await openAiApi.createChatCompletion({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                messages: messages,
            });
            if (httpResponse.status != 200) {
                throw new Error(`HTTPError {status=${httpResponse.status}, statusText:${httpResponse.statusText}`)
            }

            const response: string = httpResponse.data.choices[0].message?.content ?? "";

            // Save for later
            addToHistory(ChatMessage.asAssistant(response));
            return response;
        } catch (err) {
            history = [];
            logger.error(err);
        }
        return "Ask me again.";
    }

    return {
        read,
        chat
    };
}


export const SillyChatBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: "You are a person who loves making silly remarks.",
    historyLimit: 1
});


export const CustomAIBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Jesus").from("the Bible"),
    historyLimit: 1
});

export const JotaroBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Jotaro Kujo").from("JoJo's Bizarre Adventure"),
    historyLimit: 1
});

export const CatGirlBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Keqing").from("Genshin Impact"),
    historyLimit: 1
});

export const TsundereBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Chitoge Kirisaki").from("Nisekoi"),
    historyLimit: 1
});

export const SquidwardBot: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Squidward").from("Spongebob Squarepants"),
    historyLimit: 1
});

export const Jarvis: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("Jarvis").from("the Iron Man comics from marvel"),
    historyLimit: 2
});

export const MagicConchShell: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: pretendToBe("the magic conch shell").from("Spongebob Squarepants, the TV show"),
    historyLimit: 2
});

export const MagicEightBall: ChatBot = createChatBot(OPENAI_KEY, {
    systemMeta: "You are a magic eight ball"
});
