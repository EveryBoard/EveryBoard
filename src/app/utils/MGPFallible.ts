import { Comparable, comparableEquals } from './Comparable';
import { MGPOptional } from './MGPOptional';
import { assert } from './utils';

export abstract class MGPFallible<T extends Comparable> {
    public static success<T extends Comparable>(value: NonNullable<T>): MGPFallible<T> {
        if (value == null) throw new Error('Fallible cannot be created with empty value, use MGPFallible.failure instead');
        return new MGPFallibleSuccess(value);
    }
    public static failure<T extends Comparable>(reason: NonNullable<string>): MGPFallible<T> {
        assert(reason != null, 'reason cannot be null');
        return new MGPFallibleFailure(reason);
    }
    public abstract isSuccess(): boolean
    public abstract isFailure(): boolean
    public abstract get(): NonNullable<T>
    public abstract getOrNull(): T | null
    public abstract getReason(): string
    public abstract toOptional(): MGPOptional<T>
    public equals(other: MGPFallible<T>): boolean {
        if (this.isFailure()) {
            return other.isFailure() && this.getReason() === other.getReason();
        }
        if (other.isFailure()) {
            return false;
        }
        return comparableEquals(this.get(), other.get());
    }

}

class MGPFallibleSuccess<T extends Comparable> extends MGPFallible<T> {
    public constructor(private readonly value: NonNullable<T>) {
        super();
    }
    public isSuccess(): boolean {
        return true;
    }
    public isFailure(): boolean {
        return false;
    }
    public get(): NonNullable<T> {
        return this.value;
    }
    public getOrNull(): T | null {
        return this.value;
    }
    public getReason(): string {
        throw new Error('Cannot get failure reason from a success');
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.of(this.value);
    }
}

class MGPFallibleFailure<T extends Comparable> extends MGPFallible<T> {
    public constructor(private readonly reason: string) {
        super();
    }
    public isSuccess(): boolean {
        return false;
    }
    public isFailure(): boolean {
        return true;
    }
    public get(): NonNullable<T> {
        throw new Error('Value is absent from failure, with the following reason: ' + this.reason);
    }
    public getOrNull(): T | null {
        return null;
    }
    public getReason(): string {
        return this.reason;
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.empty();
    }
}
