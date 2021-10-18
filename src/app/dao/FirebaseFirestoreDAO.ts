import { AngularFirestore, DocumentReference, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { display, FirebaseJSONObject } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';

export interface IFirebaseFirestoreDAO<T extends FirebaseJSONObject> {

    create(newElement: T): Promise<string>;

    read(id: string): Promise<T>;

    update(id: string, modification: Partial<T>): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    getObsById(id: string): Observable<{id: string, doc: T}>;

    observingWhere(field: NonNullable<string>,
                   condition: NonNullable<firebase.firestore.WhereFilterOp>,
                   value: NonNullable<unknown>,
                   callback: FirebaseCollectionObserver<T>): () => void;
}

export abstract class FirebaseFirestoreDAO<T extends FirebaseJSONObject> implements IFirebaseFirestoreDAO<T> {
    public static VERBOSE: boolean = false;

    constructor(public readonly collectionName: string, protected afs: AngularFirestore) {}

    public async create(newElement: T): Promise<string> {
        const docRef: DocumentReference = await this.afs.collection<T>(this.collectionName).add({ ...newElement });
        return docRef.id;
    }
    public async exists(id: string): Promise<boolean> {
        const docSnapshot: firebase.firestore.DocumentSnapshot<T> =
            await this.afs.collection<T>(this.collectionName).doc(id).ref.get();
        return docSnapshot.exists;
    }
    public async read(id: string): Promise<T> {
        const docSnapshot: firebase.firestore.DocumentSnapshot<T> =
            await this.afs.collection<T>(this.collectionName).doc(id).ref.get();
        console.log({docSnapshot})
        return docSnapshot.data();
    }
    public async update(id: string, modification: Partial<T>): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(id).ref.update(modification);
    }
    public delete(messageId: string): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(messageId).ref.delete();
    }
    public set(id: string, element: T): Promise<void> {
        display(FirebaseFirestoreDAO.VERBOSE, { called: this.collectionName + '.set', id, element });
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
    public observingWhere(field: NonNullable<string>,
                          condition: NonNullable<firebase.firestore.WhereFilterOp>,
                          value: NonNullable<unknown>,
                          callback: FirebaseCollectionObserver<T>)
    : () => void
    {
        return this.afs.collection(this.collectionName).ref
            .where(field, condition, value)
            .onSnapshot((snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => {
                const createdDocs: {doc: T, id: string}[] = [];
                const modifiedDocs: {doc: T, id: string}[] = [];
                const deletedDocs: {doc: T, id: string}[] = [];
                snapshot.docChanges()
                    .forEach((change: firebase.firestore.DocumentChange<firebase.firestore.DocumentData>) => {
                        const doc: {doc: T, id: string} = {
                            id: change.doc.id,
                            doc: change.doc.data() as T,
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
