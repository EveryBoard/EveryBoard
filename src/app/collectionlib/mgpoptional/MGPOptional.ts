export class MGPOptional<T> {

    public static of(value: any): MGPOptional<any> {
        if (value == null) throw new Error("Optional cannot be create with empty value, use MGPOptional.empty instead");
        return new MGPOptional(value);
    }
    public static empty(): MGPOptional<any> {
        return new MGPOptional(null);
    }
    private constructor(private readonly value: T) {}

    public isPresent(): boolean {
        return this.value != null;
    }
    public get(): T {
        if (this.isPresent()) {
            return this.value;
        } else {
            throw new Error("Value is absent");
        }
    }
}