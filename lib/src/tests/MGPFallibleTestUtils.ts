import { MGPFallible } from '../MGPFallible';

export class MGPFallibleTestUtils {

    public static expectToBeSuccess<T>(fallible: MGPFallible<T>, value?: T): void {
        expect(fallible.isSuccess()).toBeTrue();
        if (arguments.length > 1 && value != null) {
            expect(fallible.get()).toBe(value);
        }
    }

    public static expectToBeFailure<T>(fallible: MGPFallible<T>, reason: string): void {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}
