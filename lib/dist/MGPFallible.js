"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGPFallibleTestUtils = exports.MGPFallible = void 0;
const Comparable_1 = require("./Comparable");
const MGPOptional_1 = require("./MGPOptional");
class MGPFallible {
    static success(value) {
        return new MGPFallibleSuccess(value);
    }
    static failure(reason) {
        return new MGPFallibleFailure(reason);
    }
    constructor() { }
    equals(other) {
        if (this.isFailure()) {
            return other.isFailure() && this.getReason() === other.getReason();
        }
        if (other.isFailure()) {
            return false;
        }
        return (0, Comparable_1.comparableEquals)(this.get(), other.get());
    }
}
exports.MGPFallible = MGPFallible;
class MGPFallibleSuccess extends MGPFallible {
    value;
    __nominal; // For strict typing
    constructor(value) {
        super();
        this.value = value;
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
    get() {
        return this.value;
    }
    getReason() {
        throw new Error('Cannot get failure reason from a success');
    }
    getReasonOr(value) {
        return value;
    }
    toOptional() {
        return MGPOptional_1.MGPOptional.of(this.value);
    }
    toString() {
        return `MGPFallible.success(${this.value})`;
    }
}
class MGPFallibleFailure extends MGPFallible {
    reason;
    __nominal; // For strict typing
    constructor(reason) {
        super();
        this.reason = reason;
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
    get() {
        throw new Error('Value is absent from failure, with the following reason: ' + this.reason);
    }
    getReason() {
        return this.reason;
    }
    getReasonOr(_value) {
        return this.getReason();
    }
    toOptional() {
        return MGPOptional_1.MGPOptional.empty();
    }
    toString() {
        return `MGPFallible.failure(${this.reason})`;
    }
    toOtherFallible() {
        return MGPFallible.failure(this.reason);
    }
}
class MGPFallibleTestUtils {
    static expectToBeSuccess(fallible, value) {
        expect(fallible.isSuccess()).toBeTrue();
        expect(fallible.get()).toBe(value);
    }
    static expectToBeFailure(fallible, reason) {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}
exports.MGPFallibleTestUtils = MGPFallibleTestUtils;
//# sourceMappingURL=MGPFallible.js.map