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
    public isSuccess(): this is MGPFallibleSuccess<T> {
        return true;
    }
    public isFailure(): this is MGPFallibleFailure<T> {
        return false;
    }
    public get(): T {
        return this.value;
    }
    public getReason(): string {
        throw new Error('Cannot get failure reason from a success');
    }
    public getReasonOr(value: string): string {
        return value;
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.of(this.value);
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
    public isSuccess(): this is MGPFallibleSuccess<T> {
        return false;
    }
    public isFailure(): this is MGPFallibleFailure<T> {
        return true;
    }
    public get(): T {
        throw new Error('Value is absent from failure, with the following reason: ' + this.reason);
    }
    public getReason(): string {
        return this.reason;
    }
    public getReasonOr(_value: string): string {
        return this.getReason();
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.empty();
    }
    public override toString(): string {
        return `MGPFallible.failure(${this.reason})`;
    }
    public toOtherFallible<U>(): MGPFallible<U> {
        return MGPFallible.failure(this.reason);
    }
}

export class MGPFallibleTestUtils {

    public static expectToBeSuccess<T>(fallible: MGPFallible<T>, value?: T): void {
        expect(fallible.isSuccess()).toBeTrue();
        if (value != null) {
            expect(fallible.get()).toBe(value);
        }
    }

    public static expectToBeFailure<T>(fallible: MGPFallible<T>, reason: string): void {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}
