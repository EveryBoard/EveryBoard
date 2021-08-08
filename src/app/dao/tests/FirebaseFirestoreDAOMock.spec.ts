import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import firebase from 'firebase/app';
import 'firebase/firestore';

import { display, JSONObject } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { IFirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/ObservableSubject';

export abstract class FirebaseFirestoreDAOMock<T extends JSONObject> implements IFirebaseFirestoreDAO<T> {

    public static VERBOSE: boolean = false;

    constructor(private readonly collectionName: string,
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
    public async create(newElement: T): Promise<string> {
        const elemName: string = this.collectionName + this.getStaticDB().size();
        const mappedNewElement: T = this.getServerTimestampedObject(newElement);
        await this.set(elemName, mappedNewElement);
        return elemName;
    }
    public getServerTimestampedObject<N extends JSONObject>(element: N): N {
        if (element == null) {
            return null;
        }
        const mappedNewElement: JSONObject = {};
        for (const key of Object.keys(element)) {
            if (key === 'lastMoveTime' || key === 'beginning') {
                const random: number = Math.random();
                mappedNewElement[key] = { seconds: Date.now() + random };
            } else {
                mappedNewElement[key] = element[key];
            }
        }
        return mappedNewElement as N;
    }
    public async read(id: string): Promise<T> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.read(' + id + ')');

        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return optionalOS.get().subject.getValue().doc;
        } else {
            throw new Error('Cannot read element ' + id + ' absent from ' + this.collectionName);
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

        const mappedUpdate: Partial<T> = this.getServerTimestampedObject(update);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const observableSubject: ObservableSubject<{id: string, doc: T}> = optionalOS.get();
            const oldDoc: T = observableSubject.subject.getValue().doc;
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
    public observingWhere(field: string,
                          condition: firebase.firestore.WhereFilterOp,
                          value: unknown,
                          callback: FirebaseCollectionObserver<T>): () => void
    {
        // Note, for now, only check first match field/condition/value at creation, not the added document matching it !
        display(FirebaseFirestoreDAOMock.VERBOSE,
                'FirebaseFirestoreDAOMock.observingWhere(' + field + condition + value);
        if (condition === '==') {
            display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                    { 'FirebaseFirestoreDAOMock_observingWhere': {
                        collection: this.collectionName, field, condition, value, callback } });

            const subscription: Subscription = this.subscribeToMatcher(field, value, callback);
            if (subscription == null) {
                return () => {};
            } else {
                return () => subscription.unsubscribe();
            }
        } else {
            throw new Error('FirebaseFirestoreDAOMock.observingWhere for non ==');
        }
    }
    private subscribeToMatcher(field: string,
                               value: unknown,
                               callback: FirebaseCollectionObserver<T>): Subscription
    {
        const db: MGPMap<string, ObservableSubject<{id: string, doc: T}>> = this.getStaticDB();
        for (let entryId: number = 0; entryId < db.size(); entryId++) {
            const entry: ObservableSubject<{id: string, doc: T}> = db.getByIndex(entryId).value;
            if (entry.subject.value.doc[field] === value) {
                callback.onDocumentCreated([entry.subject.value]);
                return entry.observable.subscribe((document: {id: string, doc: T}) => {
                    callback.onDocumentModified([document]);
                });
            }
        }
    }
}
