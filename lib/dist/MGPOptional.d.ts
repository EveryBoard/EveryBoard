import { Encoder } from './Encoder';
export declare class MGPOptional<T> {
    private readonly value;
    static of<T>(value: T): MGPOptional<T>;
    static ofNullable<T>(value: T | null | undefined): MGPOptional<T>;
    static empty<T>(): MGPOptional<T>;
    /**
     * Encodes a MGPOptional<T> using an encoder of T.
     * It will use the same encoding as T, and use null to encode an empty optional.
     */
    static getEncoder<T>(encoderT: Encoder<T>): Encoder<MGPOptional<T>>;
    private constructor();
    isPresent(): boolean;
    isAbsent(): boolean;
    get(): T;
    getOrElse(defaultValue: T): T;
    equals(other: MGPOptional<T>): boolean;
    equalsValue(other: T): boolean;
    toString(): string;
    map<U>(f: (value: T) => U): MGPOptional<U>;
}
