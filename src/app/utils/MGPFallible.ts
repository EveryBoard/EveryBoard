import { comparableEquals } from './Comparable';
import { MGPOptional } from './MGPOptional';

export abstract class MGPFallible<T> {
    public static success<T>(value: T): MGPFallible<T> {
        return new MGPFallibleSuccess(value);
    }
    public static failure<T>(reason: string): MGPFallible<T> {
        return new MGPFallibleFailure(reason);
    }

    public abstract isSuccess(): boolean

    public abstract isFailure(): boolean

    public abstract get(): T

    public abstract getReason(): string

    public abstract getReasonOr(value: string): string

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
    public getReason(): string {
        throw new Error('Cannot get failure reason from a success');
    }
    public getReasonOr(value: string): string {
        return value;
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.of(this.value);
    }
    public toString(): string {
        return `MGPFallible.success(${this.value})`;
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
    public getReason(): string {
        return this.reason;
    }
    public getReasonOr(_value: string): string {
        return this.getReason();
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.empty();
    }
    public toString(): string {
        return `MGPFallible.failure(${this.reason})`;
    }
}
