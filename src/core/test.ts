import { LoggerWithLabel } from "../common/logger";

const logger = LoggerWithLabel("test");

export function LogCommand(displayName: string, { sucesssMessage = 'Ok', errorMessage = 'Error' } = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();

            try {
                const result = await originalMethod.apply(this, args);
                const elapsedTime = Date.now() - startTime;
                logger.info(`${displayName} - ${sucesssMessage} execution_time=${elapsedTime}ms`);
                return result;
            } catch (error) {
                logger.error(`${displayName} - ${errorMessage}`);
                throw error;
            }
        };

        return descriptor;
    }
}