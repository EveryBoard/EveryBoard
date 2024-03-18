import { MGPValidation } from './MGPValidation';
import { Utils } from './Utils';

export class TestUtils {

    public static expectToThrowAndLog(func: () => void, error: string): void {
        if (jasmine.isSpy(Utils.logError) === false) {
            spyOn(Utils, 'logError').and.callFake((component: string, message: string) =>
                MGPValidation.failure(component + ': ' + message));
        }
        expect(func)
            .withContext('Expected Assertion failure: ' + error)
            .toThrowError('Assertion failure: ' + error);
        expect(Utils.logError).toHaveBeenCalledWith('Assertion failure', error, undefined);
    }
}
