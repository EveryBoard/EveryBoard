import { comparableEquals } from './Comparable';
import { MGPOptional } from './MGPOptional';
import { MGPValidation } from './MGPValidation';
import { assert } from './utils';

export abstract class MGPFallible<T> {
    public static success<T>(value: T): MGPFallible<T> {
        return new MGPFallibleSuccess(value);
    }
    public static failure<T>(reason: string): MGPFallible<T> {
        assert(reason != null, 'reason cannot be null');
        return new MGPFallibleFailure(reason);
    }
    public abstract isSuccess(): boolean

    public abstract isFailure(): boolean

    public abstract get(): T

    public abstract getOrNull(): T | null

    public abstract getReason(): string

    public abstract getReasonOr(value: string): string

    public abstract toOptional(): MGPOptional<T>

    public abstract toValidation(): MGPValidation

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

    private __nominal: void; // For strict typing

    public constructor(private readonly value: T) {
        super();
    }
    public isSuccess(): boolean {
        return true;
    }
    public isFailure(): boolean {
        return false;
    }
    public get(): T {
        return this.value;
    }
    public getOrNull(): T | null {
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
    public toValidation(): MGPValidation {
        return MGPValidation.SUCCESS;
    }
}

class MGPFallibleFailure<T> extends MGPFallible<T> {

    private __nominal: void; // For strict typing

    public constructor(private readonly reason: string) {
        super();
    }
    public isSuccess(): boolean {
        return false;
    }
    public isFailure(): boolean {
        return true;
    }
    public get(): T {
        throw new Error('Value is absent from failure, with the following reason: ' + this.reason);
    }
    public getOrNull(): T | null {
        return null;
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
    public toValidation(): MGPValidation {
        return MGPValidation.failure(this.reason);
    }
}
