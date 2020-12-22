import {BehaviorSubject, Observable} from 'rxjs';
import {Comparable} from './Comparable';

export class ObservableSubject<T> implements Comparable {
    public constructor(
        public subject: BehaviorSubject<T>,
        public observable: Observable<T>) {
    }
    public equals(o: any): boolean {
        throw new Error('Not needed yet, blame the dev');
    }
}
