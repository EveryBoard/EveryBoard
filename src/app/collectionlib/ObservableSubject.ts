import { BehaviorSubject, Observable } from "rxjs";

export interface ObservableSubject<T> {

    subject: BehaviorSubject<T>,

    observable: Observable<T>
}