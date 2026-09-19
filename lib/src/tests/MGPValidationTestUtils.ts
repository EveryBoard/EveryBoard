import { MGPValidation } from '../MGPValidation';

export class MGPValidationTestUtils {

    public static expectToBeSuccess(fallible: MGPValidation, context?: string): void {
        if (context == null) {
            expect(fallible.isSuccess()).toBeTrue();
        } else {
            expect(fallible.isSuccess()).withContext(context).toBeTrue();
        }
    }

    public static expectToBeFailure(fallible: MGPValidation, reason: string): void {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}
