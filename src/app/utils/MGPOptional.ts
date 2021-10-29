import { Encoder } from 'src/app/jscaip/Encoder';
import { Comparable, comparableEquals } from './Comparable';
import { JSONValue } from './utils';

export class MGPOptional<T extends Comparable> {
    public static encoder<T extends Comparable>(encoderT: Encoder<T>): Encoder<MGPOptional<T>> {
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
    public static of<T extends Comparable>(value: NonNullable<T>): MGPOptional<T> {
        if (value == null) throw new Error('Optional cannot be created with empty value, use MGPOptional.empty instead');
        return new MGPOptional(value);
    }
    public static ofNullable<T extends Comparable>(value: T): MGPOptional<T> {
        if (value == null) return MGPOptional.empty();
        return MGPOptional.of(value as NonNullable<T>);
    }
    public static empty<T extends Comparable>(): MGPOptional<T> {
        return new MGPOptional((null as T | null));
    }
    private constructor(private readonly value: T | null) {}

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
    public getOrNull(): T | null {
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
    public toString(): string {
        if (this.isAbsent()) {
            return 'MGPOptional.empty()';
        } else {
            return `MGPOptional.of(${this.value as T})`;
        }
    }
}
