import { display, FirebaseJSONObject, Utils } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { MGPOptional } from '../utils/MGPOptional';
import * as Firestore from '@angular/fire/firestore';

export interface FirebaseDocument<T> {
    id: string
    data: T
}

export type FirebaseCondition = [string, Firestore.WhereFilterOp, unknown]

export interface IFirebaseFirestoreDAO<T extends FirebaseJSONObject> {

    create(newElement: T): Promise<string>;

    read(id: string): Promise<MGPOptional<T>>;

    update(id: string, update: Firestore.UpdateData<T>): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    /**
     * Subscribes to changes of a document given its id.
     * The is given an optional, set to empty when the document is deleted.
     * If the document does not exist initially, the optional is also empty.
     */
    subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Firestore.Unsubscribe;

    observingWhere(conditions: FirebaseCondition[],
                   callback: FirebaseCollectionObserver<T>,
                   order?: string): () => void;

    findWhere(conditions: FirebaseCondition[], order?: string, limit?: number): Promise<FirebaseDocument<T>[]>

    subCollectionDAO<T extends FirebaseJSONObject>(id: string, name: string): IFirebaseFirestoreDAO<T>;
}

export abstract class FirebaseFirestoreDAO<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {

    public static VERBOSE: boolean = false;

    private readonly collection: Firestore.CollectionReference<T>;

    private readonly subDAOs: Record<string, IFirebaseFirestoreDAO<FirebaseJSONObject>> = {};

    constructor(public readonly collectionName: string,
                protected readonly firestore: Firestore.Firestore) {
        const genericConverter: Firestore.FirestoreDataConverter<T> = {
            fromFirestore(snapshot: Firestore.QueryDocumentSnapshot): T {
                return snapshot.data() as T;
            },
            toFirestore(data: Firestore.PartialWithFieldValue<T>) {
                return data;
            },
        };
        this.collection = Firestore.collection(firestore, this.collectionName).withConverter<T>(genericConverter);
    }
    public async create(newElement: T): Promise<string> {
        const docRef: Firestore.DocumentReference = await Firestore.addDoc(this.collection, newElement);
        return docRef.id;
    }
    public async read(id: string): Promise<MGPOptional<T>> {
        const docSnapshot: Firestore.DocumentSnapshot<T> = await Firestore.getDoc(Firestore.doc(this.collection, id));
        if (docSnapshot.exists()) {
            return MGPOptional.of(Utils.getNonNullable(docSnapshot.data()));
        } else {
            return MGPOptional.empty();
        }
    }
    public async exists(id: string): Promise<boolean> {
        return (await this.read(id)).isPresent();
    }
    public async update(id: string, update: Firestore.UpdateData<T>): Promise<void> {
        return Firestore.updateDoc(Firestore.doc(this.collection, id), update);
    }
    public delete(id: string): Promise<void> {
        return Firestore.deleteDoc(Firestore.doc(this.collection, id));
    }
    public set(id: string, element: T): Promise<void> {
        display(FirebaseFirestoreDAO.VERBOSE, { called: this.collectionName + '.set', id, element });
        return Firestore.setDoc(Firestore.doc(this.collection, id), element);
    }
    public subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Firestore.Unsubscribe {
        return Firestore.onSnapshot(Firestore.doc(this.collection, id), (doc: Firestore.DocumentSnapshot<T>) => {
            callback(MGPOptional.ofNullable(doc.data()));
        });
    }
    public async findWhere(conditions: FirebaseCondition[], order?: string, limit?: number)
    : Promise<FirebaseDocument<T>[]>
    {
        const query: Firestore.Query<T> = this.constructQuery(conditions, order, limit);
        const snapshot: Firestore.QuerySnapshot<T> = await Firestore.getDocs(query);
        return snapshot.docs.map((doc: Firestore.QueryDocumentSnapshot<T>) => {
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
                          callback: FirebaseCollectionObserver<T>,
                          order?: string)
    : () => void
    {
        const query: Firestore.Query<T> = this.constructQuery(conditions, order);
        return Firestore.onSnapshot(query, (snapshot: Firestore.QuerySnapshot<T>) => {
            const createdDocs: FirebaseDocument<T>[] = [];
            const modifiedDocs: FirebaseDocument<T>[] = [];
            const deletedDocs: FirebaseDocument<T>[] = [];
            snapshot.docChanges()
                .forEach((change: Firestore.DocumentChange<T>) => {
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
    private constructQuery(conditions: FirebaseCondition[], order?: string, limit?: number): Firestore.Query<T> {
        let query: Firestore.Query<T> = Firestore.query(this.collection);
        if (order != null) {
            query = Firestore.query(query, Firestore.orderBy(order));
        }
        if (limit != null) {
            query = Firestore.query(query, Firestore.limit(limit));
        }
        for (const condition of conditions) {
            query = Firestore.query(query, Firestore.where(condition[0], condition[1], condition[2]));
        }
        return query;
    }
    public subCollectionDAO<T extends FirebaseJSONObject>(id: string, name: string): IFirebaseFirestoreDAO<T> {
        const fullPath: string = `${this.collection.path}/${id}/${name}`;
        if (fullPath in this.subDAOs) {
            return this.subDAOs[fullPath] as IFirebaseFirestoreDAO<T>;
        } else {
            const subDAO: FirebaseFirestoreDAO<T> = new class extends FirebaseFirestoreDAO<T> {
                constructor(firestore: Firestore.Firestore) {
                    super(fullPath, firestore);
                }
            }(this.firestore);
            this.subDAOs[fullPath] = subDAO;
            return subDAO;
        }
    }
}
