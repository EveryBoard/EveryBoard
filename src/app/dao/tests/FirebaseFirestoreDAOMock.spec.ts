/* eslint-disable max-lines-per-function */
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { assert, display, FirebaseJSONObject, Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { FirebaseDocumentWithId, IFirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { Time } from 'src/app/domain/Time';

type FirebaseCondition = [string, firebase.firestore.WhereFilterOp, unknown];

type OS<T> = ObservableSubject<MGPOptional<FirebaseDocumentWithId<T>>>;

export abstract class FirebaseFirestoreDAOMock<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {

    public static VERBOSE: boolean = false;

    public static mockServerTime(): Time {
        const dateNow: number = Date.now();
        const ms: number = dateNow % 1000;
        const seconds: number = (dateNow - ms) / 1000;
        const nanoseconds: number = ms * 1000 * 1000;
        return { seconds, nanoseconds };
    }

    public callbacks: [FirebaseCondition[], FirebaseCollectionObserver<T>][] = [];
    constructor(public readonly collectionName: string,
                public VERBOSE: boolean,
    ) {
        this.reset();
    }
    public abstract getStaticDB(): MGPMap<string, OS<T>>;

    public abstract resetStaticDB(): void;

    public reset(): void {
        const removed: string = this.getStaticDB() != null ? this.getStaticDB().size() + ' removed' : 'not initialised yet';
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.reset, ' + removed);

        this.resetStaticDB();
    }
    public getObsById(id: string): Observable<MGPOptional<T>> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.getObsById(' + id + ')');

        const optionalOS: MGPOptional<OS<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return optionalOS.get().observable
                .pipe(map((subject: MGPOptional<FirebaseDocumentWithId<T>>) =>
                    subject.map((subject: FirebaseDocumentWithId<T>) => subject.doc)));
        } else {
            throw new Error('No doc of id ' + id + ' to observe in ' + this.collectionName);
            // TODO: check that observing unexisting doc throws
        }
    }
    public async create(elementWithFieldValue: T): Promise<string> {
        const elemName: string = this.collectionName + this.getStaticDB().size();
        const elementWithTime: T = Utils.getNonNullable(this.getServerTimestampedObject(elementWithFieldValue));
        await this.set(elemName, elementWithTime);
        return elemName;
    }
    public getServerTimestampedObject<N extends FirebaseJSONObject>(elementWithFieldValue: N): N {
        const elementWithTime: FirebaseJSONObject = {};
        for (const key of Object.keys(elementWithFieldValue)) {
            if (elementWithFieldValue[key] instanceof firebase.firestore.FieldValue) {
                elementWithTime[key] = FirebaseFirestoreDAOMock.mockServerTime();
            } else {
                elementWithTime[key] = elementWithFieldValue[key];
            }
        }
        return elementWithTime as N;
    }
    public async read(id: string): Promise<MGPOptional<T>> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.read(' + id + ')');

        const optionalOS: MGPOptional<OS<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return MGPOptional.of(Utils.getNonNullable(optionalOS.get().subject.getValue().get().doc));
        } else {
            return MGPOptional.empty();
        }
    }
    public async set(id: string, doc: T): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.set(' + id + ', ' + JSON.stringify(doc) + ')');

        const mappedDoc: T = Utils.getNonNullable(this.getServerTimestampedObject(doc));
        const optionalOS: MGPOptional<OS<T>> = this.getStaticDB().get(id);
        const tid: FirebaseDocumentWithId<T> = { id, doc: mappedDoc };
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(MGPOptional.of(tid));
        } else {
            const subject: BehaviorSubject<MGPOptional<FirebaseDocumentWithId<T>>> =
                new BehaviorSubject(MGPOptional.of(tid));
            const observable: Observable<MGPOptional<FirebaseDocumentWithId<T>>> = subject.asObservable();
            this.getStaticDB().put(id, new ObservableSubject(subject, observable));
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], subject.value.get().doc)) {
                    callback[1].onDocumentCreated([subject.value.get()]);
                }
            }
        }
        return Promise.resolve();
    }
    public async update(id: string, update: Partial<T>): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.update(' + id + ', ' + JSON.stringify(update) + ')');

        const optionalOS: MGPOptional<OS<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const observableSubject: OS<T> = optionalOS.get();
            const oldDoc: T = observableSubject.subject.getValue().get().doc;
            const mappedUpdate: Partial<T> = Utils.getNonNullable(this.getServerTimestampedObject(update));
            const newDoc: T = { ...oldDoc, ...mappedUpdate };
            observableSubject.subject.next(MGPOptional.of({ id, doc: newDoc }));
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], observableSubject.subject.value.get().doc)) {
                    callback[1].onDocumentModified([observableSubject.subject.value.get()]);
                }
            }
            return Promise.resolve();
        } else {
            throw new Error('Cannot update element ' + id + ' absent from ' + this.collectionName);
        }
    }
    public async delete(id: string): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.delete(' + id + ')');

        const optionalOS: MGPOptional<OS<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const removed: FirebaseDocumentWithId<T> = optionalOS.get().subject.value.get();
            optionalOS.get().subject.next(MGPOptional.empty());
            this.getStaticDB().delete(id);
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], removed.doc)) {
                    callback[1].onDocumentDeleted([removed]);
                }
            }
        } else {
            throw new Error('Cannot delete element ' + id + ' absent from ' + this.collectionName);
        }
    }
    public observingWhere(conditions: [string,
                                       firebase.firestore.WhereFilterOp,
                                       unknown][],
                          callback: FirebaseCollectionObserver<T>): () => void
    {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                { 'FirebaseFirestoreDAOMock_observingWhere': {
                    collection: this.collectionName,
                    conditions } });
        // Note, for now, only check first match field/condition/value at creation, not the added document matching it!
        const subscription: Subscription | null = this.subscribeToMatchers(conditions, callback);
        if (subscription == null) {
            return () => {};
        } else {
            return () => subscription.unsubscribe();
        }
    }
    private subscribeToMatchers(conditions: FirebaseCondition[],
                                callback: FirebaseCollectionObserver<T>): Subscription | null
    {
        const db: MGPMap<string, OS<T>> = this.getStaticDB();
        this.callbacks.push([conditions, callback]);
        for (let entryId: number = 0; entryId < db.size(); entryId++) {
            const entry: OS<T> = db.getByIndex(entryId).value;
            if (this.conditionsHold(conditions, entry.subject.value.get().doc)) {
                callback.onDocumentCreated([entry.subject.value.get()]);

            }
        }
        return null;
    }
    private conditionsHold(conditions: FirebaseCondition[],
                           doc?: T): boolean {
        if (doc === undefined) return false;
        for (const condition of conditions) {
            assert(condition[1] === '==', 'FirebaseFirestoreDAOMock currently only supports == as a condition');
            if (doc[condition[0]] !== condition[2]) {
                return false;
            }
        }
        return true;
    }
}
