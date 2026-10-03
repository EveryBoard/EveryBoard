/* eslint-disable max-lines-per-function */
import { BehaviorSubject, Observable } from 'rxjs';

export class ObservableSubject<T> {
    public constructor(
        public subject: BehaviorSubject<T>,
        public observable: Observable<T>) {
    }
}
