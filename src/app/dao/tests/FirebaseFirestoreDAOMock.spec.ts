/* eslint-disable max-lines-per-function */
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { display, FirebaseJSONObject, FirebaseJSONValue, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { FirebaseCondition, FirebaseDocument, IFirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { Time } from 'src/app/domain/Time';
import { FieldValue, Unsubscribe, UpdateData } from '@angular/fire/firestore';

type DocumentSubject<T> = ObservableSubject<MGPOptional<FirebaseDocument<T>>>;

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
    private readonly subDAOs: MGPMap<string, IFirebaseFirestoreDAO<FirebaseJSONObject>> = new MGPMap();
    constructor(public readonly collectionName: string,
                public VERBOSE: boolean)
    {
        this.reset();
    }
    public abstract getStaticDB(): MGPMap<string, DocumentSubject<T>>;

    public abstract resetStaticDB(): void;

    public reset(): void {
        const removed: string = this.getStaticDB() != null ? this.getStaticDB().size() + ' removed' : 'not initialised yet';
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.reset, ' + removed);

        this.resetStaticDB();
    }
    public subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Unsubscribe {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.subscribeToChanges(' + id + ')');

        const optionalOS: MGPOptional<DocumentSubject<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const subscription: Subscription =
                optionalOS.get().observable.subscribe((subject: MGPOptional<FirebaseDocument<T>>) =>
                    callback(subject.map((doc: FirebaseDocument<T>) => doc.data)));
            return () => {
                subscription.unsubscribe();
            };
        } else {
            throw new Error('No doc of id ' + id + ' to observe in ' + this.collectionName);
            // TODO: check that observing unexisting doc throws
        }
    }
    public async create(element: T): Promise<string> {
        const elemName: string = this.collectionName + this.getStaticDB().size();
        await this.set(elemName, element);
        return elemName;
    }
    private replaceFieldValueWith<N extends FirebaseJSONObject>(elementWithFieldValue: N,
                                                                replacement: FirebaseJSONValue)
    : N
    {
        const elementWithReplacement: FirebaseJSONObject = {};
        for (const key of Object.keys(elementWithFieldValue)) {
            if (elementWithFieldValue[key] instanceof FieldValue) {
                elementWithReplacement[key] = replacement;
            } else {
                elementWithReplacement[key] = elementWithFieldValue[key];
            }
        }
        return elementWithReplacement as N;
    }
    private updateFieldValueWith<N extends FirebaseJSONObject>(element: N,
                                                               replacement: FirebaseJSONValue)
    : UpdateData<N>
    {
        const update: FirebaseJSONObject = {};
        for (const key of Object.keys(element)) {
            if (element[key] instanceof FieldValue) {
                update[key] = replacement;
            }
        }
        return update as UpdateData<N>;
    }

    private hasFieldValue(element: FirebaseJSONObject): boolean {
        for (const key of Object.keys(element)) {
            if (element[key] instanceof FieldValue) {
                return true;
            }
        }
        return false;
    }
    public async read(id: string): Promise<MGPOptional<T>> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + '.read(' + id + ')');

        const optionalOS: MGPOptional<DocumentSubject<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            return MGPOptional.of(Utils.getNonNullable(optionalOS.get().subject.getValue().get().data));
        } else {
            return MGPOptional.empty();
        }
    }
    public async set(id: string, data: T): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.set(' + id + ', ' + JSON.stringify(data) + ')');

        const localData: T = this.replaceFieldValueWith(data, null);
        await this.internalSet(id, localData);
        if (this.hasFieldValue(data)) {
            const serverData: UpdateData<T> =
                this.updateFieldValueWith(data, FirebaseFirestoreDAOMock.mockServerTime());
            // We do not await here to simulate the fact that the server will take some time to send us the update
            void this.internalUpdate(id, serverData);
        }
    }
    public async internalSet(id: string, data: T): Promise<void> {
        const optionalOS: MGPOptional<DocumentSubject<T>> = this.getStaticDB().get(id);
        const tid: FirebaseDocument<T> = { id, data };
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(MGPOptional.of(tid));
        } else {
            const subject: BehaviorSubject<MGPOptional<FirebaseDocument<T>>> =
                new BehaviorSubject(MGPOptional.of(tid));
            const observable: Observable<MGPOptional<FirebaseDocument<T>>> = subject.asObservable();
            this.getStaticDB().put(id, new ObservableSubject(subject, observable));
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], subject.value.get().data)) {
                    callback[1].onDocumentCreated([subject.value.get()]);
                }
            }
        }
        return Promise.resolve();
    }
    public async update(id: string, update: UpdateData<T>): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                this.collectionName + '.update(' + id + ', ' + JSON.stringify(update) + ')');

        const localUpdate: UpdateData<T> = this.replaceFieldValueWith(update, null);
        await this.internalUpdate(id, localUpdate);
        if (this.hasFieldValue(update)) {
            const serverUpdate: UpdateData<T> =
                this.replaceFieldValueWith(update, FirebaseFirestoreDAOMock.mockServerTime());
            await this.internalUpdate(id, serverUpdate);
        }
    }
    private async internalUpdate(id: string, update: UpdateData<T>): Promise<void> {
        const optionalOS: MGPOptional<DocumentSubject<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const observableSubject: DocumentSubject<T> = optionalOS.get();
            const oldDoc: T = observableSubject.subject.getValue().get().data;
            const newDoc: T = { ...oldDoc, ...update };
            observableSubject.subject.next(MGPOptional.of({ id, data: newDoc }));
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], observableSubject.subject.value.get().data)) {
                    callback[1].onDocumentModified([observableSubject.subject.value.get()]);
                }
            }
            return Promise.resolve();
        } else {
            throw new Error(`Cannot update element '${id}' absent from '${this.collectionName}'`);
        }
    }
    public async delete(id: string): Promise<void> {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, this.collectionName + `.delete('${id}')`);

        const optionalOS: MGPOptional<DocumentSubject<T>> = this.getStaticDB().get(id);
        if (optionalOS.isPresent()) {
            const removed: FirebaseDocument<T> = optionalOS.get().subject.value.get();
            optionalOS.get().subject.next(MGPOptional.empty());
            this.getStaticDB().delete(id);
            for (const callback of this.callbacks) {
                if (this.conditionsHold(callback[0], removed.data)) {
                    callback[1].onDocumentDeleted([removed]);
                }
            }
        } else {
            throw new Error('Cannot delete element ' + id + ' absent from ' + this.collectionName);
        }
    }
    public observingWhere(conditions: FirebaseCondition[],
                          callback: FirebaseCollectionObserver<T>): () => void
    {
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE,
                { 'FirebaseFirestoreDAOMock_observingWhere': {
                    collection: this.collectionName,
                    conditions } });
        const subscription: Subscription = this.subscribeToMatchers(conditions, callback);
        return () => subscription.unsubscribe();
    }
    private subscribeToMatchers(conditions: FirebaseCondition[],
                                callback: FirebaseCollectionObserver<T>): Subscription
    {
        const db: MGPMap<string, DocumentSubject<T>> = this.getStaticDB();
        this.callbacks.push([conditions, callback]);
        const matchingDocs: FirebaseDocument<T>[] = [];
        for (let entryId: number = 0; entryId < db.size(); entryId++) {
            const entry: DocumentSubject<T> = db.getByIndex(entryId).value;
            if (this.conditionsHold(conditions, entry.subject.value.get().data)) {
                matchingDocs.push(entry.subject.value.get());
            }
        }
        callback.onDocumentCreated(matchingDocs);
        return new Subscription(() => {
            // Upon unsubscription, remove this callback from the callbacks
            this.callbacks = this.callbacks.filter(
                (value: [FirebaseCondition[], FirebaseCollectionObserver<T>]): boolean => {
                    return (value[0] === conditions && value[1] === callback) === false;
                });
        });
    }
    private conditionsHold(conditions: FirebaseCondition[], doc: T): boolean {
        for (const condition of conditions) {
            assert(condition[1] === '==', 'FirebaseFirestoreDAOMock currently only supports == as a condition');
            if (doc[condition[0]] !== condition[2]) {
                return false;
            }
        }
        return true;
    }
    public async findWhere(conditions: FirebaseCondition[]): Promise<FirebaseDocument<T>[]> {
        const matchingDocs: FirebaseDocument<T>[] = [];
        this.getStaticDB().forEach((item: {key: string, value: DocumentSubject<T>}) => {
            const id: string = item.value.subject.value.get().id;
            const data: T = item.value.subject.value.get().data;
            if (this.conditionsHold(conditions, data)) {
                matchingDocs.push({ id, data });
            }
        });
        return matchingDocs;
    }
    public subCollectionDAO<T extends FirebaseJSONObject>(id: string, name: string): IFirebaseFirestoreDAO<T> {
        if (this.subDAOs.containsKey(name)) {
            return this.subDAOs.get(name).get() as IFirebaseFirestoreDAO<T>;
        } else {
            const superName: string = this.collectionName;
            const verbosity: boolean = this.VERBOSE;
            type OS = ObservableSubject<MGPOptional<FirebaseDocument<T>>>;
            class CustomMock extends FirebaseFirestoreDAOMock<T> {
                private static db: MGPMap<string, OS>;
                public getStaticDB(): MGPMap<string, OS> {
                    return CustomMock.db;
                }
                public resetStaticDB(): void {
                    CustomMock.db = new MGPMap();
                }
                constructor() {
                    super(`${superName}/${id}/${name}`, verbosity);
                }
            }
            const mock: FirebaseFirestoreDAOMock<T> = new CustomMock();
            this.subDAOs.set(name, mock);
            return mock;
        }
    }
}
