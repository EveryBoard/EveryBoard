import { Encoder } from 'src/app/jscaip/encoder';
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
                    return MGPOptional.of(encoderT.decode(encoded));
                }
            }
        };
    }
    public static of<T extends Comparable>(value: T): MGPOptional<T> {
        if (value == null) throw new Error('Optional cannot be create with empty value, use MGPOptional.empty instead');
        return new MGPOptional(value);
    }
    public static ofNullable<T extends Comparable>(value: T): MGPOptional<T> {
        if (value == null) return MGPOptional.empty();
        return MGPOptional.of(value);
    }
    public static empty<T extends Comparable>(): MGPOptional<T> {
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
    public equals(other: MGPOptional<T>): boolean {
        if (this.isAbsent()) {
            return other.isAbsent();
        }
        if (other.isAbsent()) {
            return false;
        }
        return comparableEquals(this.value, other.value);
    }
}
