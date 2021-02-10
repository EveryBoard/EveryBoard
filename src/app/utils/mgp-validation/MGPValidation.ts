export class MGPValidation {
    public static readonly SUCCESS: MGPValidation = new MGPValidation(null);

    private constructor(public readonly reason: string) {
    }
    public static failure(reason: string): MGPValidation {
        if (reason == null) {
            throw new Error('MGPValidation.failure cannot be called with null.');
        }
        return new MGPValidation(reason);
    }
    public isFailure(): boolean {
        return this.reason != null;
    }
    public isSuccess(): boolean {
        return !this.isFailure();
    }
    public getReason(): string {
        if (this.isFailure()) {
            return this.reason;
        } else {
            throw new Error('MGPValidation: Cannot extract failure reason from success.');
        }
    }
}
