export class MGPValidation {
    public static readonly SUCCESS: MGPValidation = new MGPValidation(null);

    private constructor(public readonly reason: string) {
    }
    public static failure(reason: string): MGPValidation {
        if (reason == null) {
            throw new Error('MGPValidation.failure called with null');
        }
        return new MGPValidation(reason);
    }
    public onFailure(f: (arg: string) => void): MGPValidation {
        if (this.isFailure()) {
            f(this.reason);
        }
        return this;
    }
    public onSuccess(f: () => void): MGPValidation {
        if (this.isSuccess()) {
            f();
        }
        return this;
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
            throw new Error('MGPValidation: Cannot extract reason from success');
        }
    }
}
