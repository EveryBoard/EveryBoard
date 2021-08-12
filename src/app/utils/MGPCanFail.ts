import { Comparable, comparableEquals } from './Comparable';
import { MGPOptional } from './MGPOptional';

export abstract class MGPCanFail<T extends Comparable> {
    public static success<T extends Comparable>(value: NonNullable<T>): MGPCanFail<T> {
        if (value == null) throw new Error('CanFail cannot be created with empty value, use MGPCanFail.failure instead');
        return new MGPCanFailSuccess(value);
    }
    public static failure<T extends Comparable>(reason: NonNullable<string>): MGPCanFail<T> {
        assert(reason != null, 'reason cannot be null');
        return new MGPCanFailFailure(reason);
    }
    public abstract isSuccess(): boolean
    public abstract isFailure(): boolean
    public abstract get(): NonNullable<T>
    public abstract getOrNull(): T
    public abstract getReason(): string
    public abstract toOptional(): MGPOptional<T>
    public equals(other: MGPCanFail<T>): boolean {
        if (this.isFailure()) {
            return other.isFailure() && this.getReason() === other.getReason();
        }
        if (other.isFailure()) {
            return false;
        }
        return comparableEquals(this.get(), other.get());
    }

}

class MGPCanFailSuccess<T extends Comparable> extends MGPCanFail<T> {
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
    public getOrNull(): T {
        return this.value;
    }
    public getReason(): string {
        throw new Error('Cannot get failure reason from a success');
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.of(this.value);
    }
}

class MGPCanFailFailure<T extends Comparable> extends MGPCanFail<T> {
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
        throw new Error('Value is absent from failure');
    }
    public getOrNull(): T {
        return null;
    }
    public getReason(): string {
        return this.reason;
    }
    public toOptional(): MGPOptional<T> {
        return MGPOptional.empty();
    }
}
