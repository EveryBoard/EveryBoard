import * as Firestore from '@firebase/firestore';
import { Subscription } from 'rxjs';

import { JSONPrimitive, MGPOptional, Utils } from '@everyboard/lib';


export type FirestoreJSONPrimitive = JSONPrimitive | Firestore.FieldValue;
export type FirestoreJSONValue =
    FirestoreJSONPrimitive |
    FirestoreJSONObject |
    Array<FirestoreJSONValueWithoutArray> |
    ReadonlyArray<FirestoreJSONValueWithoutArray>;
export type FirestoreJSONValueWithoutArray = FirestoreJSONPrimitive | FirestoreJSONObject;
export type FirestoreJSONObject = { [member: string]: FirestoreJSONValue };

export interface FirestoreDocument<T> {
    id: string;
    data: T;
}

export type FirestoreCondition = [string, Firestore.WhereFilterOp, unknown]

export interface IFirestoreDAO<T extends FirestoreJSONObject> {

    create(newElement: T): Promise<string>;

    read(id: string): Promise<MGPOptional<T>>;

    update(id: string, update: Firestore.UpdateData<T>): Promise<void>;

    delete(id: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    /**
     * Subscribes to changes of a document given its id.
     * The is given an optional, set to empty when the document is deleted.
     * If the document does not exist initially, the optional is also empty.
     */
    subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Subscription;

    findWhere(conditions: FirestoreCondition[], order?: string, limit?: number): Promise<FirestoreDocument<T>[]>;

}

export abstract class FirestoreDAO<T extends FirestoreJSONObject> implements IFirestoreDAO<T> {

    public readonly collection: Firestore.CollectionReference<T>;

    public constructor(public readonly collectionName: string) {
        const genericConverter: Firestore.FirestoreDataConverter<T> = {
            fromFirestore(snapshot: Firestore.QueryDocumentSnapshot): T {
                return snapshot.data() as T;
            },
            toFirestore(data: Firestore.PartialWithFieldValue<T>) {
                return data;
            },
        };
        const firestore: Firestore.Firestore = Firestore.getFirestore();
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

    public async delete(id: string): Promise<void> {
        return Firestore.deleteDoc(Firestore.doc(this.collection, id));
    }

    public async set(id: string, element: T): Promise<void> {
        return Firestore.setDoc(Firestore.doc(this.collection, id), element);
    }

    public subscribeToChanges(id: string, callback: (doc: MGPOptional<T>) => void): Subscription {
        return new Subscription(Firestore.onSnapshot(Firestore.doc(this.collection, id),
                                                     (doc: Firestore.DocumentSnapshot<T>) => {
                                                         callback(MGPOptional.ofNullable(doc.data()));
                                                     }));
    }

    public async findWhere(conditions: FirestoreCondition[])
    : Promise<FirestoreDocument<T>[]>
    {
        const query: Firestore.Query<T> = this.constructQuery(conditions);
        const snapshot: Firestore.QuerySnapshot<T> = await Firestore.getDocs(query);
        return snapshot.docs.map((doc: Firestore.QueryDocumentSnapshot<T>) => {
            return {
                id: doc.id,
                data: doc.data(),
            };
        });
    }

    private constructQuery(conditions: FirestoreCondition[]): Firestore.Query<T> {
        let query: Firestore.Query<T> = Firestore.query(this.collection);
        for (const condition of conditions) {
            query = Firestore.query(query, Firestore.where(condition[0], condition[1], condition[2]));
        }
        return query;
    }

}
