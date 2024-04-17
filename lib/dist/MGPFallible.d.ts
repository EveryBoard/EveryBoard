import { MGPOptional } from './MGPOptional';
export declare abstract class MGPFallible<T> {
    static success<T>(value: T): MGPFallible<T>;
    static failure<T>(reason: string): MGPFallible<T>;
    protected constructor();
    abstract isSuccess(): this is MGPFallibleSuccess<T>;
    abstract isFailure(): this is MGPFallibleFailure<T>;
    abstract get(): T;
    abstract getReason(): string;
    abstract getReasonOr(value: string): string;
    abstract toOptional(): MGPOptional<T>;
    equals(other: MGPFallible<T>): boolean;
}
declare class MGPFallibleSuccess<T> extends MGPFallible<T> {
    private readonly value;
    private readonly __nominal;
    constructor(value: T);
    isSuccess(): this is MGPFallibleSuccess<T>;
    isFailure(): this is MGPFallibleFailure<T>;
    get(): T;
    getReason(): string;
    getReasonOr(value: string): string;
    toOptional(): MGPOptional<T>;
    toString(): string;
}
declare class MGPFallibleFailure<T> extends MGPFallible<T> {
    private readonly reason;
    private readonly __nominal;
    constructor(reason: string);
    isSuccess(): this is MGPFallibleSuccess<T>;
    isFailure(): this is MGPFallibleFailure<T>;
    get(): T;
    getReason(): string;
    getReasonOr(_value: string): string;
    toOptional(): MGPOptional<T>;
    toString(): string;
    toOtherFallible<U>(): MGPFallible<U>;
}
export declare class MGPFallibleTestUtils {
    static expectToBeSuccess<T>(fallible: MGPFallible<T>, value: T): void;
    static expectToBeFailure<T>(fallible: MGPFallible<T>, reason: string): void;
}
export {};
