import { BehaviorSubject, Observable } from 'rxjs';
import { ComparableObject } from './Comparable';
export declare class ObservableSubject<T> implements ComparableObject {
    subject: BehaviorSubject<T>;
    observable: Observable<T>;
    constructor(subject: BehaviorSubject<T>, observable: Observable<T>);
    equals(): boolean;
}
