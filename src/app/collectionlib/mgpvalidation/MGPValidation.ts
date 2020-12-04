
export class MGPValidation {
    private constructor(private reason?: string) {
    }
    public static success(): MGPValidation {
        return new MGPValidation(null);
    }
    public static failure(reason: string): MGPValidation {
        return new MGPValidation(reason);
    }
    public onFailure(f: (arg: string) => void): MGPValidation {
        if (this.isFailure()) { f(this.reason) }
        return this;
    }
    public onSuccess(f: () => void): MGPValidation {
        if (this.isSuccess()) { f() }
        return this;
    }
    public isFailure(): boolean {
        return this.reason !== null;
    }
    public isSuccess(): boolean {
        return !this.isFailure()
    }
    public getReason(): string {
        if (this.isFailure()) {
            return this.reason;
        } else {
            throw new Error("MGPValidation: Cannot extract reason from success");
        }
    }
}
