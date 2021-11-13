import { Encoder } from 'src/app/jscaip/Encoder';
import { comparableEquals } from './Comparable';
import { JSONValue } from './utils';

export class MGPOptional<T> {
    public static encoder<T>(encoderT: Encoder<T>): Encoder<MGPOptional<T>> {
        return new class extends Encoder<MGPOptional<T>> {
            public encode(opt: MGPOptional<T>): JSONValue {
                if (opt.isPresent()) {
                    return encoderT.encode(opt.get());
                } else {
                    return null;
                }
            }
            public decode(encoded: JSONValue): MGPOptional<T> {
                if (encoded === null) {
                    return MGPOptional.empty();
                } else {
                    return MGPOptional.of(encoderT.decode(encoded) as NonNullable<T>);
                }
            }
        };
    }
    public static of<T>(value: NonNullable<T>): MGPOptional<T> {
        if (value == null) throw new Error('Optional cannot be created with empty value, use MGPOptional.empty instead');
        return new MGPOptional(value);
    }
    public static ofNullable<T>(value: T): MGPOptional<T> {
        if (value == null) return MGPOptional.empty();
        return MGPOptional.of(value as NonNullable<T>);
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
    public get(): NonNullable<T> {
        if (this.isPresent()) {
            return this.value as NonNullable<T>;
        } else {
            throw new Error('Value is absent');
        }
    }
    public getOrNull(): T {
        return this.value;
    }
    public equals(other: MGPOptional<T>): boolean {
        if (this.isAbsent()) {
            return other.isAbsent();
        }
        if (other.isAbsent()) {
            return false;
        }
        return comparableEquals(this.value, other.value);
    }
    public equalsValue(other: T | null): boolean {
        const optional: MGPOptional<T> = MGPOptional.ofNullable(other);
        return this.equals(optional);
    }
    public toString(): string {
        if (this.isAbsent()) {
            return 'MGPOptional.empty()';
        } else {
            return `MGPOptional.of(${this.value.toString()})`;
        }
    }
}
