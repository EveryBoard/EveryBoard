"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableSubject = void 0;
class ObservableSubject {
    subject;
    observable;
    constructor(subject, observable) {
        this.subject = subject;
        this.observable = observable;
    }
    equals() {
        throw new Error('Not needed yet, blame the dev');
    }
}
exports.ObservableSubject = ObservableSubject;
//# sourceMappingURL=ObservableSubject.js.map