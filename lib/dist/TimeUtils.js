"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUtils = exports.getMillisecondsElapsed = exports.getMilliseconds = void 0;
function getMilliseconds(time) {
    return time.seconds * 1000 + (time.nanoseconds / (1000 * 1000));
}
exports.getMilliseconds = getMilliseconds;
function getMillisecondsElapsed(first, second) {
    return getMilliseconds(second) - getMilliseconds(first);
}
exports.getMillisecondsElapsed = getMillisecondsElapsed;
class TimeUtils {
    static async sleep(ms) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, ms);
        });
    }
}
exports.TimeUtils = TimeUtils;
//# sourceMappingURL=TimeUtils.js.map