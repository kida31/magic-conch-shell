import { Command, CommandCategory } from "../commands/command";

const quickRegisteredCommands: Map<string, Command> = new Map();

export function getQuickRegistered(): Command[] {
    return Array.from(quickRegisteredCommands.values());
}

/**
 * Decorator for single execute functions to be registered as commands
 * @param name 
 * @param description 
 * @returns 
 */
export function QuickRegisterCommand(options: {
    name: string,
    description?: string,
    alias?: string[],
    category?: CommandCategory
}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // TODO validate execute function

        // Create a new command object based on the provided name and description
        const command: Command = {
            ...options,
            execute: descriptor.value
        };

        quickRegisteredCommands.set(command.name, command);
        return descriptor;
    };
}