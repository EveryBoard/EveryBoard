export abstract class Encoder<T> {
    public abstract encode(t: T): number
    public abstract decode(n: number): T
}

