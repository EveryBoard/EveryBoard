import { comparableEquals } from './Comparable';
import { MGPOptional } from './MGPOptional';

export abstract class MGPFallible<T> {

    public static success<U>(value: U): MGPFallible<U> {
        return new MGPFallibleSuccess(value);
    }
    public static failure<U>(reason: string): MGPFallible<U> {
        return new MGPFallibleFailure(reason);
    }

    protected constructor() {}

    public abstract isSuccess(): this is MGPFallibleSuccess<T>;

    public abstract isFailure(): this is MGPFallibleFailure<T>;

    public abstract get(): T;

    public abstract getReason(): string;

    public abstract getReasonOr(value: string): string;

    public abstract toOptional(): MGPOptional<T>;

    public abstract map<U>(f: (value: T) => U): MGPFallible<U>;

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

class MGPFallibleSuccess<T> extends MGPFallible<T> {

    private readonly __nominal: void; // For strict typing

    public constructor(private readonly value: T) {
        super();
    }

    public override isSuccess(): this is MGPFallibleSuccess<T> {
        return true;
    }

    public override isFailure(): this is MGPFallibleFailure<T> {
        return false;
    }

    public override get(): T {
        return this.value;
    }

    public override getReason(): string {
        throw new Error('Cannot get failure reason from a success');
    }

    public override getReasonOr(value: string): string {
        return value;
    }

    public override toOptional(): MGPOptional<T> {
        return MGPOptional.of(this.value);
    }

    public override map<U>(f: (value: T) => U): MGPFallible<U> {
        return MGPFallible.success(f(this.value));
    }

    public override toString(): string {
        return `MGPFallible.success(${this.value})`;
    }

}

class MGPFallibleFailure<T> extends MGPFallible<T> {

    private readonly __nominal: void; // For strict typing

    public constructor(private readonly reason: string) {
        super();
    }

    public override isSuccess(): this is MGPFallibleSuccess<T> {
        return false;
    }

    public override isFailure(): this is MGPFallibleFailure<T> {
        return true;
    }

    public override get(): T {
        throw new Error('Value is absent from failure, with the following reason: ' + this.reason);
    }

    public override getReason(): string {
        return this.reason;
    }

    public override getReasonOr(_value: string): string {
        return this.getReason();
    }

    public override toOptional(): MGPOptional<T> {
        return MGPOptional.empty();
    }

    public override map<U>(f: (value: T) => U): MGPFallible<U> {
        return this.toOtherFallible<U>();
    }

    public override toString(): string {
        return `MGPFallible.failure(${this.reason})`;
    }

    public toOtherFallible<U>(): MGPFallible<U> {
        return MGPFallible.failure(this.reason);
    }
}
