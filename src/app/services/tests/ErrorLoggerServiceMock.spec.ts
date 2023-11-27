import { MGPValidation } from '@everyboard/lib';
import { JSONValue } from '@everyboard/lib';

export class ErrorLoggerServiceMock {

    public static logError(component: string, message: string, data?: JSONValue): MGPValidation {
        return MGPValidation.failure(component + ': ' + message);
    }
}
