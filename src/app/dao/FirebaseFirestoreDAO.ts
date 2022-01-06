import { AngularFirestore, DocumentReference, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { assert, display, FirebaseJSONObject, Utils } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { MGPOptional } from '../utils/MGPOptional';

export interface FirebaseDocumentWithId<T> {
    id: string
    doc: T
}

export interface IFirebaseFirestoreDAO<T extends FirebaseJSONObject> {

    create(newElement: T): Promise<string>;

    update(id: string, modification: Partial<T>): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    /**
     * Observes a specific document given its id.
     * The observable gives an optional, set to empty when the document is deleted
     */
    getObsById(id: string): Observable<MGPOptional<T>>;

    observingWhere(conditions: [string,
                                firebase.firestore.WhereFilterOp,
                                unknown][],
                   callback: FirebaseCollectionObserver<T>): () => void;
}

export abstract class FirebaseFirestoreDAO<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {
    public static VERBOSE: boolean = false;

    constructor(public readonly collectionName: string, protected afs: AngularFirestore) {}

    public async create(newElement: T): Promise<string> {
        const docRef: DocumentReference = await this.afs.collection<T>(this.collectionName).add({ ...newElement });
        return docRef.id;
    }
    public async read(id: string): Promise<MGPOptional<T>> {
        const docSnapshot: firebase.firestore.DocumentSnapshot<T> =
            await this.afs.collection<T>(this.collectionName).doc(id).ref.get();
        if (docSnapshot.exists) {
            return MGPOptional.of(docSnapshot.data() as T);
        } else {
            return MGPOptional.empty();
        }
    }
    public async exists(id: string): Promise<boolean> {
        return (await this.read(id)).isPresent();
    }
    public async update(id: string, modification: Partial<T>): Promise<void> {
        return this.afs.collection(this.collectionName).doc(id).ref.update(modification);
    }
    public delete(messageId: string): Promise<void> {
        return this.afs.collection(this.collectionName).doc(messageId).ref.delete();
    }
    public set(id: string, element: T): Promise<void> {
        display(FirebaseFirestoreDAO.VERBOSE, { called: this.collectionName + '.set', id, element });
        return this.afs.collection(this.collectionName).doc(id).set(element);
    }
    // Collection Observer

    public getObsById(id: string): Observable<MGPOptional<T>> {
        return this.afs.doc(this.collectionName + '/' + id).snapshotChanges()
            .pipe(map((actions: Action<DocumentSnapshot<T>>) => {
                return MGPOptional.ofNullable(actions.payload.data());
            }));
    }
    /**
     * Observe the data according to the given conditions, where a condition consists of:
     * - a field
     * - a comparison
     * - a value that is matched against the field using the comparison
     **/
    public observingWhere(conditions: [string,
                                       firebase.firestore.WhereFilterOp,
                                       unknown][],
                          callback: FirebaseCollectionObserver<T>)
    : () => void
    {
        assert(conditions.length >= 1, 'observingWhere called without conditions');
        let query: firebase.firestore.Query<unknown> | null = null;
        for (const condition of conditions) {
            if (query == null) {
                query = this.afs.collection(this.collectionName).ref
                    .where(condition[0], condition[1], condition[2]);
            } else {
                query = query.where(condition[0], condition[1], condition[2]);
            }
        }
        return Utils.getNonNullable(query)
            .onSnapshot((snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => {
                const createdDocs: FirebaseDocumentWithId<T>[] = [];
                const modifiedDocs: FirebaseDocumentWithId<T>[] = [];
                const deletedDocs: FirebaseDocumentWithId<T>[] = [];
                snapshot.docChanges()
                    .forEach((change: firebase.firestore.DocumentChange<T>) => {
                        const doc: {doc: T, id: string} = {
                            id: change.doc.id,
                            doc: change.doc.data(),
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
}
