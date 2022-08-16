import { MGPValidation } from 'src/app/utils/MGPValidation';
import { JSONValue } from 'src/app/utils/utils';

export class ErrorLoggerServiceMock {

    public static logError(component: string, message: string, data?: JSONValue): MGPValidation {
        return MGPValidation.failure(component + ': ' + message);
    }
}
