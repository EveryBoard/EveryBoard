import { Encoder } from 'src/app/jscaip/encoder';
import { JSONValue } from '../utils/utils';

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
                    return MGPOptional.of(encoderT.decode(encoded));
                }
            }
        };
    }
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
    // TODO: instead of having the comparator argument, require T to implement compare
    public equals(t: MGPOptional<T>, comparator: (a: T, b: T) => boolean): boolean {
        if (this.isAbsent()) {
            return t.isAbsent();
        }
        if (t.isAbsent()) {
            return false;
        }
        return comparator(this.value, t.value);
    }
}
