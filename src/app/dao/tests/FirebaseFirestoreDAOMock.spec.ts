import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import firebase from 'firebase/app';
import 'firebase/firestore';

import { assert, display, FirebaseJSONObject } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { IFirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { Time } from 'src/app/domain/Time';

export abstract class FirebaseFirestoreDAOMock<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {

    public static VERBOSE: boolean = false;

    public static mockServerTime(): Time {
        const dateNow: number = Date.now();
        const ms: number = dateNow % 1000;
        const seconds: number = (dateNow - ms) / 1000;
        const nanoseconds: number = ms * 1000 * 1000;
        return { seconds, nanoseconds };
    }
    constructor(public readonly collectionName: string,
                public VERBOSE: boolean,
    ) {
        this.reset();
    }
    public abstract getStaticDB(): MGPMap<string, ObservableSubject<{id: string, doc: T}>>;

    public abstract resetStaticDB(): void;

    public reset(): void {
        const removed: string = this.getStaticDB() ? this.getStaticDB().size() + ' removed' : 'not initialised yet';
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.reset, ' + removed);

        this.resetStaticDB();
    }
    public getObsById(id: string): Observable<{id: string, doc: T}> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.getObsById(' + id + ')');

        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return optionalOS.get().observable;
        } else {
            throw new Error('No doc of id ' + id + ' to observe in ' + this.collectionName);
            // TODO: check that observing unexisting doc throws
        }
    }
    public async create(elementWithFieldValue: T): Promise<string> {
        const elemName: string = this.collectionName + this.getStaticDB().size();
        const elementWithTime: T = this.getServerTimestampedObject(elementWithFieldValue);
        await this.set(elemName, elementWithTime);
        return elemName;
    }
    public getServerTimestampedObject<N extends FirebaseJSONObject>(elementWithFieldValue: N): N {
        if (elementWithFieldValue == null) {
            return null;
        }
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
    public async read(id: string): Promise<T> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.read(' + id + ')');

        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return optionalOS.get().subject.getValue().doc;
        } else {
            return null; // Firebase returns null if a document does not exist. This is behaviour relied upon!
        }
    }
    public async set(id: string, doc: T): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.set(' + id + ', ' + JSON.stringify(doc) + ')');

        const mappedDoc: T = this.getServerTimestampedObject(doc);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        const tid: {id: string, doc: T} = { id, doc: mappedDoc };
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(tid);
        } else {
            const subject: BehaviorSubject<{id: string, doc: T}> = new BehaviorSubject<{id: string, doc: T}>(tid);
            const observable: Observable<{id: string, doc: T}> = subject.asObservable();
            this.getStaticDB().put(id, new ObservableSubject(subject, observable));
        }
        return Promise.resolve();
    }
    public async update(id: string, update: Partial<T>): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.update(' + id + ', ' + JSON.stringify(update) + ')');

        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const observableSubject: ObservableSubject<{id: string, doc: T}> = optionalOS.get();
            const oldDoc: T = observableSubject.subject.getValue().doc;
            const mappedUpdate: Partial<T> = this.getServerTimestampedObject(update);
            const newDoc: T = { ...oldDoc, ...mappedUpdate };
            observableSubject.subject.next({ id, doc: newDoc });
            return Promise.resolve();
        } else {
            throw new Error('Cannot update element ' + id + ' absent from ' + this.collectionName);
        }
    }
    public async delete(id: string): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.delete(' + id + ')');

        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(null);
            this.getStaticDB().delete(id);
        } else {
            throw new Error('Cannot delete element ' + id + ' absent from ' + this.collectionName);
        }
    }
    public observingWhere(conditions: [NonNullable<string>,
                                       NonNullable<firebase.firestore.WhereFilterOp>,
                                       NonNullable<unknown>][],
                          callback: FirebaseCollectionObserver<T>): () => void
    {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                { 'FirebaseFirestoreDAOMock_observingWhere': {
                    collection: this.collectionName,
                    conditions } });
        // Note, for now, only check first match field/condition/value at creation, not the added document matching it!
        const subscription: Subscription = this.subscribeToMatchers(conditions, callback);
        if (subscription == null) {
            return () => {};
        } else {
            return () => subscription.unsubscribe();
        }
    }
    private subscribeToMatchers(conditions: [NonNullable<string>,
                                            NonNullable<firebase.firestore.WhereFilterOp>,
                                            NonNullable<unknown>][],
                                callback: FirebaseCollectionObserver<T>): Subscription
    {
        const db: MGPMap<string, ObservableSubject<{id: string, doc: T}>> = this.getStaticDB();
        for (let entryId: number = 0; entryId < db.size(); entryId++) {
            const entry: ObservableSubject<{id: string, doc: T}> = db.getByIndex(entryId).value;
            let matches: boolean = true;
            for (const condition of conditions) {
                assert(condition[1] === '==', 'FirebaseFirestoreDAOMock currently only supports == as a condition');
                if (entry.subject.value.doc[condition[0]] !== condition[2]) {
                    matches = false;
                }
            }
            if (matches) {
                const ID: string = entry.subject.value.id;
                const OBJECT: T = { ...entry.subject.value.doc };
                callback.onDocumentCreated([entry.subject.value]);
                return entry.observable.subscribe((document: {id: string, doc: T}) => {
                    if (document == null) {
                        callback.onDocumentDeleted([{ id: ID, doc: OBJECT }]);
                    } else {
                        callback.onDocumentModified([document]);
                    }
                });
            }
        }
    }
}
