import { comparableEquals } from './Comparable';
import { Encoder } from './Encoder';
import { JSONValue } from './JSON';

export abstract class MGPOptional<T> {

    public static of<U>(value: U): MGPOptional<U> {
        return new MGPOptionalPresent(value);
    }

    public static ofNullable<T>(value: T | null | undefined): MGPOptional<T> {
        if (value == null) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(value);
        }
    }

    public static empty<T>(): MGPOptional<T> {
        return new MGPOptionalAbsent();
    }

    /**
     * Encodes a MGPOptional<T> using an encoder of T.
     * It will use the same encoding as T, and use null to encode an empty optional.
     */
    public static getEncoder<U>(encoderT: Encoder<U>): Encoder<MGPOptional<U>> {
        return new class extends Encoder<MGPOptional<U>> {
            public encode(opt: MGPOptional<U>): JSONValue {
                if (opt.isPresent()) {
                    return encoderT.encode(opt.get());
                } else {
                    return null;
                }
            }
            public decode(encoded: JSONValue): MGPOptional<U> {
                if (encoded === null) {
                    return MGPOptional.empty();
                } else {
                    return MGPOptional.of(encoderT.decode(encoded));
                }
            }
        };
    }

    public abstract isPresent(): boolean;

    public abstract isAbsent(): boolean;

    public abstract get(): T;

    public abstract getOrElse(defaultValue: T): T;

    public abstract orElse(other: MGPOptional<T>): MGPOptional<T>;

    public abstract equals(other: MGPOptional<T>): boolean;

    public abstract equalsValue(other: T): boolean;

    public abstract toString(): string;

    public abstract map<U>(f: (value: T) => U): MGPOptional<U>;
}

class MGPOptionalAbsent<T> extends MGPOptional<T> {

    public override isPresent(): boolean {
        return false;
    }

    public override isAbsent(): boolean {
        return true;
    }

    public override get(): T {
        throw new Error('Value is absent');
    }

    public override getOrElse(defaultValue: T): T {
        return defaultValue;
    }

    public override orElse(other: MGPOptional<T>): MGPOptional<T> {
        return other;
    }

    public override equals(other: MGPOptional<T>): boolean {
        return other.isAbsent();
    }

    public override equalsValue(_other: T): boolean {
        return false;
    }

    public override toString(): string {
        return 'MGPOptional.empty()';
    }

    public override map<U>(f: (value: T) => U): MGPOptional<U> {
        return MGPOptional.empty();
    }

}

class MGPOptionalPresent<T> extends MGPOptional<T> {

    public constructor(private readonly value: T) {
        super();
    }

    public override isPresent(): boolean {
        return true;
    }

    public override isAbsent(): boolean {
        return false;
    }
    public override get(): T {
        return this.value;
    }

    public override getOrElse(_defaultValue: T): T {
        return this.value;
    }

    public override orElse(_other: MGPOptional<T>): MGPOptional<T> {
        return this;
    }

    public override equals(other: MGPOptional<T>): boolean {
        return other.isPresent() && this.equalsValue(other.get());
    }

    public override equalsValue(other: T): boolean {
        return comparableEquals(other, this.value);
    }

    public override toString(): string {
        return `MGPOptional.of(${this.value})`;
    }

    public override map<U>(f: (value: T) => U): MGPOptional<U> {
        return MGPOptional.of(f(this.value));
    }
}
