"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReversibleMap = exports.MGPMap = void 0;
const MGPOptional_1 = require("./MGPOptional");
const Comparable_1 = require("./Comparable");
const MGPSet_1 = require("./MGPSet");
const Utils_1 = require("./Utils");
class MGPMap {
    map;
    isImmutable;
    static from(record) {
        const keys = Object.keys(record);
        const map = new MGPMap();
        for (const key of keys) {
            map.set(key, record[key]);
        }
        return map;
    }
    constructor(map = [], isImmutable = false) {
        this.map = map;
        this.isImmutable = isImmutable;
    }
    makeImmutable() {
        this.isImmutable = true;
    }
    get(key) {
        for (const keymap of this.map) {
            if ((0, Comparable_1.comparableEquals)(keymap.key, key)) {
                return MGPOptional_1.MGPOptional.of(keymap.value);
            }
        }
        return MGPOptional_1.MGPOptional.empty();
    }
    getAnyPair() {
        if (this.size() > 0) {
            return MGPOptional_1.MGPOptional.of(this.map[0]);
        }
        else {
            return MGPOptional_1.MGPOptional.empty();
        }
    }
    forEach(callback) {
        for (const element of this.map) {
            callback(element);
        }
    }
    putAll(m) {
        this.assertImmutability('putAll');
        for (const entry of m.map) {
            this.put(entry.key, entry.value);
        }
    }
    assertImmutability(methodCalled) {
        Utils_1.Utils.assert(this.isImmutable === false, 'Cannot call ' + methodCalled + ' on immutable map!');
    }
    put(key, value) {
        this.assertImmutability('put');
        for (const entry of this.map) {
            if ((0, Comparable_1.comparableEquals)(entry.key, key)) {
                const oldValue = entry.value;
                entry.value = value;
                return MGPOptional_1.MGPOptional.of(oldValue);
            }
        }
        this.map.push({ key, value });
        return MGPOptional_1.MGPOptional.empty();
    }
    containsKey(key) {
        return this.map.some((entry) => (0, Comparable_1.comparableEquals)(entry.key, key));
    }
    size() {
        return this.map.length;
    }
    listKeys() {
        return this.map.map((entry) => entry.key);
    }
    listValues() {
        return this.map.map((entry) => entry.value);
    }
    getKeySet() {
        return new MGPSet_1.MGPSet(this.listKeys());
    }
    filter(predicate) {
        const filtered = new MGPMap();
        for (const keyValue of this.map) {
            if (predicate(keyValue.key, keyValue.value)) {
                filtered.set(keyValue.key, keyValue.value);
            }
        }
        return filtered;
    }
    replace(key, newValue) {
        this.assertImmutability('replace');
        const oldValue = this.get(key);
        if (oldValue.isAbsent()) {
            throw new Error('No Value to replace for key ' + key.toString() + '!');
        }
        else {
            this.put(key, newValue);
            return newValue;
        }
    }
    set(key, firstValue) {
        this.assertImmutability('set');
        if (this.containsKey(key)) {
            throw new Error('Key ' + key.toString() + ' already exists in map!');
        }
        else {
            this.map.push({ key, value: firstValue });
        }
    }
    delete(key) {
        this.assertImmutability('delete');
        for (let i = 0; i < this.map.length; i++) {
            const entry = this.map[i];
            if ((0, Comparable_1.comparableEquals)(entry.key, key)) {
                const oldValue = this.map[i].value;
                const beforeDeleted = this.map.slice(0, i);
                const afterDeleted = this.map.slice(i + 1);
                this.map = beforeDeleted.concat(afterDeleted);
                return oldValue;
            }
        }
        throw new Error('No value to delete for key "' + key.toString() + '"!');
    }
    getCopy() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newMap = new this.constructor();
        for (const key of this.listKeys()) {
            newMap.set(key, this.get(key).get());
        }
        return newMap;
    }
    equals(other) {
        const thisKeySet = this.getKeySet();
        const otherKeySet = other.getKeySet();
        if (thisKeySet.equals(otherKeySet) === false) {
            return false;
        }
        for (const key of thisKeySet) {
            const thisValue = this.get(key).get();
            const otherValue = other.get(key);
            Utils_1.Utils.assert(otherValue.isPresent(), 'value is absent in a map even though its key is present!');
            if ((0, Comparable_1.comparableEquals)(thisValue, otherValue.get()) === false) {
                return false;
            }
        }
        return true;
    }
}
exports.MGPMap = MGPMap;
class ReversibleMap extends MGPMap {
    reverse() {
        const reversedMap = new ReversibleMap();
        for (const key of this.listKeys()) {
            const value = this.get(key).get();
            if (reversedMap.containsKey(value)) {
                reversedMap.get(value).get().add(key);
            }
            else {
                const newSet = new MGPSet_1.MGPSet();
                newSet.add(key);
                reversedMap.set(value, newSet);
            }
        }
        return reversedMap;
    }
}
exports.ReversibleMap = ReversibleMap;
//# sourceMappingURL=MGPMap.js.map