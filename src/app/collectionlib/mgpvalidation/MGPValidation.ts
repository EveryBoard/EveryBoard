
export class MGPValidation {
    private constructor(private error?: string) {
    }
    public static success(): MGPValidation {
        return new MGPValidation(null);
    }
    public static error(error: string): MGPValidation {
        return new MGPValidation(error);
    }
    public ifError(f: (arg: string) => void): MGPValidation {
        if (this.isError()) { f(this.error) }
        return this;
    }
    public ifSuccess(f: () => void): MGPValidation {
        if (this.isSuccess()) { f() }
        return this;
    }
    public isError(): boolean {
        return this.error !== null;
    }
    public isSuccess(): boolean {
        return !this.isError()
    }
    public getError(): string {
        if (this.isError()) {
            return this.error;
        } else {
            throw new Error("Cannot extract error from success");
        }
    }
}
