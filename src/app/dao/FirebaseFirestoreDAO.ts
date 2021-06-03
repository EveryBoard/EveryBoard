import { AngularFirestore, DocumentReference, CollectionReference, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { display, JSONObject } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { DomainWrapper } from '../domain/DomainWrapper';

export interface IFirebaseFirestoreDAO<T extends JSONObject> {

    create(newElement: T): Promise<string>;

    read(id: string): Promise<T>;

    update(id: string, modification: Partial<T>): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    getObsById(id: string): Observable<{id: string, doc: T}>;

    observingWhere(field: string,
        condition: firebase.firestore.WhereFilterOp,
        value: any,
        callback: FirebaseCollectionObserver<T>): () => void;
}

export abstract class FirebaseFirestoreDAO<T extends JSONObject> implements IFirebaseFirestoreDAO<T> {
    public static VERBOSE: boolean = false;

    constructor(private readonly collectionName: string, protected afs: AngularFirestore) {}

    public async create(newElement: T): Promise<string> {
        const docRef: DocumentReference = await this.afs.collection<T>(this.collectionName).add({ ...newElement });
        return docRef.id;
    }
    public async read(id: string): Promise<T> {
        const docSnapshot = await this.afs.collection<T>(this.collectionName).doc(id).ref.get();
        return docSnapshot.data() as T;
    }
    public async update(id: string, modification: Partial<T>): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(id).ref.update(modification);
    }
    public delete(messageId: string): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(messageId).ref.delete();
    }
    public set(id: string, element: T): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(id).set(element);
    }
    // Collection Observer

    public getObsById(id: string): Observable<{ id: string, doc: T}> {
        return this.afs.doc(this.collectionName + '/' + id).snapshotChanges()
            .pipe(map((actions: Action<DocumentSnapshot<T>>) => {
                return {
                    doc: actions.payload.data() as T,
                    id,
                };
            }));
    }
    public observingWhere(field: string,
                          condition: firebase.firestore.WhereFilterOp,
                          value: any,
                          callback: FirebaseCollectionObserver<T>): () => void
    {
        let collection: CollectionReference | firebase.firestore.Query<firebase.firestore.DocumentData> =
            this.afs.collection(this.collectionName).ref;
        if (field && condition && value) {
            collection = collection.where(field, condition, value);
        }
        return collection.where(field, condition, value)
            .onSnapshot((snapshot) => {
                const createdDocs: {doc: T, id: string}[] = [];
                const modifiedDocs: {doc: T, id: string}[] = [];
                const deletedDocs: {doc: T, id: string}[] = [];
                snapshot.docChanges()
                    .forEach((change: firebase.firestore.DocumentChange<firebase.firestore.DocumentData>) => {
                        const doc: {doc: T, id: string} = {
                            id: change.doc.id,
                            doc: change.doc.data() as T,
                        };
                        if (change.type === 'added') createdDocs.push(doc);
                        else if (change.type === 'modified') modifiedDocs.push(doc);
                        else if (change.type === 'removed') deletedDocs.push(doc);
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
