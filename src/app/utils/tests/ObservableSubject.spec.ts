import { BehaviorSubject, Observable } from 'rxjs';
import { ComparableObject } from '../Comparable';

export class ObservableSubject<T> implements ComparableObject {
    public constructor(
        public subject: BehaviorSubject<T>,
        public observable: Observable<T>) {
    }
    public equals(): boolean {
        throw new Error('Not needed yet, blame the dev');
    }
}
