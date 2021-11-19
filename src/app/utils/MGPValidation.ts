import { MGPFallible } from './MGPFallible';

export class MGPValidation {
    public static readonly SUCCESS: MGPValidation = new MGPValidation(null);
    public static ofFallible<T>(fallible: MGPFallible<T>): MGPValidation {
        if (fallible.isSuccess()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(fallible.getReason());
        }
    }

    private constructor(public readonly reason: string | null) {
    }
    public static failure(reason: string): MGPValidation {
        return new MGPValidation(reason);
    }
    public isFailure(): boolean {
        return this.isSuccess() === false;
    }
    public isSuccess(): boolean {
        return this.reason == null;
    }
    public getReason(): string {
        if (this.isSuccess()) {
            throw new Error('MGPValidation: Cannot extract failure reason from success.');
        } else {
            return this.reason as string; // always a string here
        }
    }
    public toFallible<T>(successValue: T): MGPFallible<T> {
        if (this.isSuccess()) {
            return MGPFallible.success(successValue);
        } else {
            return MGPFallible.failure(this.getReason());
        }
    }
    public toFailedFallible<T>(): MGPFallible<T> {
        if (this.isSuccess()) {
            throw new Error('MGPValidation: cannot convert into failed fallible.');
        } else {
            return MGPFallible.failure(this.getReason());
        }
    }
}
