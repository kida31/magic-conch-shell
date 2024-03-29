import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { ChatBot } from "../interfaces";
import { LoggerWithLabel } from "../../common/logger";

type BotOption = {
    systemMeta?: string;
    historyLimit?: number;
    max_tokens?: number;
    model?: string;
};

const ChatMessage = {
    asAssistant: (message: string): ChatCompletionRequestMessage => ({ role: "assistant", content: message }),
    asSystem: (message: string): ChatCompletionRequestMessage => ({ role: "system", content: message }),
    asUser: (message: string, name?: string): ChatCompletionRequestMessage => ({
        role: "user",
        content: message,
        name: name
    }),
};

export function createChatBot(key: string, options?: BotOption): ChatBot {
    const logger = LoggerWithLabel("ChatBot");

    const openAiApi: OpenAIApi = new OpenAIApi(new Configuration({ apiKey: key }));
    let history: ChatCompletionRequestMessage[] = [];

    const MODEL = options?.model ?? "gpt-3.5-turbo";
    const HISTORY_LIMIT = options?.historyLimit ?? 0;
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
                throw new Error(`HTTPError {status=${httpResponse.status}, statusText:${httpResponse.statusText}`);
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
