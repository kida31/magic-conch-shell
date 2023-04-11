import { ExtendedClient } from "../../core/extended-client";
import { Command, CommandContext, isMessage } from "../command";

export default [
    class SetNameCommand implements Command {
        name: string = "name";
        alias?: string[] | undefined;
        description?: string | undefined;
        category?: string | undefined;
        // data?: Jsonable | Jsonable[] | undefined;
        async execute(context: CommandContext): Promise<void> {
            if (isMessage(context)) {
                const name = context.content.trim();
                await context.client.user.setUsername(name);
                await context.react("✅");
            }
        }
    },

    class SetAvatarCommand implements Command {
        name: string = "avatar";
        alias?: string[] | undefined;
        description?: string | undefined;
        category?: string | undefined;
        // data?: Jsonable | Jsonable[] | undefined;
        async execute(context: CommandContext): Promise<void> {
            if (isMessage(context)) {
                const url = context.content.trim();
                if (url.startsWith("https")) {
                    await context.client.user.setAvatar(url);
                    await context.react("✅");
                }
            }
        }
    },

    class ForgetChatCommand implements Command {
        name: string = "forget";
        alias?: string[] | undefined;
        description?: string | undefined;
        category?: string | undefined;
        // data?: Jsonable | Jsonable[] | undefined;
        async execute(context: CommandContext): Promise<void> {
            const chatbot = (<ExtendedClient>context.client).chatbot;
            if (chatbot) {
                for(let i = 0; i < 20; i++) {
                    await chatbot.read("\n");
                }
            }

            if (isMessage(context)) {
                await context.react("✅");
            }
        }
    }
]