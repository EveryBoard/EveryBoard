import { JSONValue, MGPValidation } from '@everyboard/lib';

export class ErrorLoggerServiceMock {

    // TODO:  grep for ErrorLoggerServiceMock.logError, use TestUtils.expectToThrowInstead there
    public static logError(component: string, message: string, data?: JSONValue): MGPValidation {
        return MGPValidation.failure(component + ': ' + message);
    }
}
