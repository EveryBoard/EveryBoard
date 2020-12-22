export class MGPOptional<T> {
    public static of<T>(value: T): MGPOptional<T> {
        if (value == null) throw new Error('Optional cannot be create with empty value, use MGPOptional.empty instead');
        return new MGPOptional(value);
    }
    public static ofNullable<T>(value: T): MGPOptional<T> {
        if (value == null) return MGPOptional.empty();
        return MGPOptional.of(value);
    }
    public static empty<T>(): MGPOptional<T> {
        return new MGPOptional(null);
    }
    private constructor(private readonly value: T) {}

    public isPresent(): boolean {
        return this.value != null;
    }
    public isAbsent(): boolean {
        return this.value == null;
    }
    public get(): T {
        if (this.isPresent()) {
            return this.value;
        } else {
            throw new Error('Value is absent');
        }
    }
    public getOrNull(): T {
        return this.value;
    }
    public equals(t: MGPOptional<T>, comparator: (a: T, b: T) => boolean) {
        if (this.isAbsent()) {
            return t.isAbsent();
        }
        if (t.isAbsent()) {
            return false;
        }
        return comparator(this.value, t.value);
    }
}
