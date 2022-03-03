import { display, FirebaseJSONObject, Utils } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { MGPOptional } from '../utils/MGPOptional';
import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentChange, DocumentReference, DocumentSnapshot, Firestore, FirestoreDataConverter, getDoc, getDocs, onSnapshot, PartialWithFieldValue, Query, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, Unsubscribe, UpdateData, updateDoc, where, WhereFilterOp } from '@angular/fire/firestore';

export interface FirebaseDocument<T> {
    id: string
    data: T
}

export type FirebaseCondition = [string, WhereFilterOp, unknown]

export interface IFirebaseFirestoreDAO<T extends FirebaseJSONObject> {

    create(newElement: T): Promise<string>;

    update(id: string, update: UpdateData<T>): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    /**
     * Subscribes to changes of a document given its id.
     * The is given an optional, set to empty when the document is deleted.
     * If the document does not exist initially, the optional is also empty.
     */
    subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Unsubscribe;

    observingWhere(conditions: FirebaseCondition[],
                   callback: FirebaseCollectionObserver<T>): () => void;

    findWhere(conditions: FirebaseCondition[]): Promise<FirebaseDocument<T>[]>
}

export abstract class FirebaseFirestoreDAO<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {

    public static VERBOSE: boolean = false;

    private readonly collection: CollectionReference<T>;

    constructor(public readonly collectionName: string,
                private readonly firestore: Firestore) {
        const genericConverter: FirestoreDataConverter<T> = {
            fromFirestore(snapshot: QueryDocumentSnapshot): T {
                return snapshot.data() as T;
            },
            toFirestore(data: PartialWithFieldValue<T>) {
                return data;
            },
        };
        this.collection = collection(firestore, this.collectionName).withConverter<T>(genericConverter);
    }
    public async create(newElement: T): Promise<string> {
        const docRef: DocumentReference = await addDoc(this.collection, { ...newElement });
        return docRef.id;
    }
    public async read(id: string): Promise<MGPOptional<T>> {
        const docSnapshot: DocumentSnapshot<T> = await getDoc(doc(this.collection, id));
        if (docSnapshot.exists()) {
            return MGPOptional.of(Utils.getNonNullable(docSnapshot.data()));
        } else {
            return MGPOptional.empty();
        }
    }
    public async exists(id: string): Promise<boolean> {
        return (await this.read(id)).isPresent();
    }
    public async update(id: string, update: UpdateData<T>): Promise<void> {
        return updateDoc(doc(this.collection, id), update);
    }
    public delete(id: string): Promise<void> {
        return deleteDoc(doc(this.collection, id));
    }
    public set(id: string, element: T): Promise<void> {
        display(FirebaseFirestoreDAO.VERBOSE, { called: this.collectionName + '.set', id, element });
        return setDoc(doc(this.collection, id), element);
    }

    public subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Unsubscribe {
        return onSnapshot(doc(this.collection, id), (doc: DocumentSnapshot<T>) => {
            callback(MGPOptional.ofNullable(doc.data()));
        });
    }
    public async findWhere(conditions: FirebaseCondition[]): Promise<FirebaseDocument<T>[]> {
        const snapshot: QuerySnapshot<T> = await getDocs(this.constructQuery(conditions));
        return snapshot.docs.map((doc: QueryDocumentSnapshot<T>) => {
            return {
                id: doc.id,
                data: doc.data(),
            };
        });
    }
    /**
     * Observe the data according to the given conditions, where a condition consists of:
     * - a field
     * - a comparison
     * - a value that is matched against the field using the comparison
     **/
    public observingWhere(conditions: FirebaseCondition[],
                          callback: FirebaseCollectionObserver<T>)
    : () => void
    {
        return onSnapshot(this.constructQuery(conditions), (snapshot: QuerySnapshot<T>) => {
            const createdDocs: FirebaseDocument<T>[] = [];
            const modifiedDocs: FirebaseDocument<T>[] = [];
            const deletedDocs: FirebaseDocument<T>[] = [];
            snapshot.docChanges()
                .forEach((change: DocumentChange<T>) => {
                    const doc: FirebaseDocument<T> = {
                        id: change.doc.id,
                        data: change.doc.data(),
                    };
                    switch (change.type) {
                        case 'added':
                            createdDocs.push(doc);
                            break;
                        case 'modified':
                            modifiedDocs.push(doc);
                            break;
                        case 'removed':
                            deletedDocs.push(doc);
                            break;
                    }
                });
            if (createdDocs.length > 0) {
                display(FirebaseFirestoreDAO.VERBOSE,
                        'firebase gave us ' + createdDocs.length + ' NEW ' + this.collectionName);
                callback.onDocumentCreated(createdDocs);
            }
            if (modifiedDocs.length > 0) {
                display(FirebaseFirestoreDAO.VERBOSE,
                        'firebase gave us ' + modifiedDocs.length + ' MODIFIED ' + this.collectionName);
                callback.onDocumentModified(modifiedDocs);
            }
            if (deletedDocs.length > 0) {
                display(FirebaseFirestoreDAO.VERBOSE,
                        'firebase gave us ' + deletedDocs.length + ' DELETED ' + this.collectionName);
                callback.onDocumentDeleted(deletedDocs);
            }
        });
    }
    private constructQuery(conditions: FirebaseCondition[]): Query<T> {
        let constructedQuery: Query<T> = query(this.collection);
        for (const condition of conditions) {
            constructedQuery = query(constructedQuery, where(condition[0], condition[1], condition[2]));
        }
        return Utils.getNonNullable(constructedQuery);
    }
}
