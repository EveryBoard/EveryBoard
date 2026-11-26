/* eslint-disable max-lines-per-function */
import { BehaviorSubject, Observable } from 'rxjs'; // TODO: create ticket to move that outside of game, it's DAO only gebruiken
// Then delete rx

export class ObservableSubject<T> {
    public constructor(
        public subject: BehaviorSubject<T>,
        public observable: Observable<T>,
    ) {
    }
}
