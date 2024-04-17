"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberMap = void 0;
const MGPMap_1 = require("./MGPMap");
const MGPOptional_1 = require("./MGPOptional");
class NumberMap extends MGPMap_1.MGPMap {
    add(key, value) {
        const oldValue = this.get(key).get();
        return this.put(key, oldValue + value);
    }
    addOrSet(key, value) {
        if (this.containsKey(key)) {
            return this.add(key, value);
        }
        else {
            this.set(key, value);
            return MGPOptional_1.MGPOptional.of(value);
        }
    }
}
exports.NumberMap = NumberMap;
//# sourceMappingURL=NumberMap.js.map