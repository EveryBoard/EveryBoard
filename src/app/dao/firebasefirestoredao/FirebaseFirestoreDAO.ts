import { AngularFirestore, DocumentReference, CollectionReference } from "@angular/fire/firestore";
import { FirebaseCollectionObserver } from "../FirebaseCollectionObserver";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface IFirebaseFirestoreDAO<T, PT> {

    create(newElement: T): Promise<String>;

    read(id: string): Promise<T>;

    update(id: string, modification: PT): Promise<void>;

    delete(messageId: string): Promise<void>;

    set(id: string, element: T): Promise<void>;

    getObsById(id: string): Observable<{id: string, doc: T}>;

    observingWhere(field: string,
        condition: firebase.firestore.WhereFilterOp,
        value: any,
        callback: FirebaseCollectionObserver<T>): () => void;
}

export abstract class FirebaseFirestoreDAO<T, PT> implements IFirebaseFirestoreDAO<T, PT> {

    public static VERBOSE: boolean = false;

    // T is a full element

    // PT is a partially full element

    // Simple CRUDS

    constructor(private readonly collectionName: string, protected afs: AngularFirestore) {}

    public async create(newElement: T): Promise<String> {
        const docRef: DocumentReference = await this.afs.collection<T>(this.collectionName).add(newElement);
        return docRef.id;
    }
    public async read(id: string): Promise<T> {
        const docSnapshot = await this.afs.collection<T>(this.collectionName).doc(id).ref.get();
        return docSnapshot.data() as T;
    }
    public async update(id: string, modification: PT): Promise<void> {
        console.log(modification); // TODELETE
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
            .pipe(map(actions => {
                return {
                    doc: actions.payload.data() as T,
                    id
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
            .onSnapshot(snapshot => {
                const createdDocs: {doc: T, id: string}[] = [];
                const modifiedDocs: {doc: T, id: string}[] = [];
                const deletedDocs: {doc: T, id: string}[] = [];
                snapshot.docChanges().forEach(change => {
                    const doc: {doc: T, id: string} = {
                        id: change.doc.id,
                        doc: change.doc.data() as T
                };
                if (change.type === "added") createdDocs.push(doc);
                else if (change.type === "modified") modifiedDocs.push(doc);
                else if (change.type === "removed") deletedDocs.push(doc);
            });
            if (createdDocs.length > 0) {
                if (FirebaseFirestoreDAO.VERBOSE) console.log("firebase gave us " + createdDocs.length + " NEW " + this.collectionName);
                callback.onDocumentCreated(createdDocs);
            }
            if (modifiedDocs.length > 0) {
                if (FirebaseFirestoreDAO.VERBOSE) console.log("firebase gave us " + modifiedDocs.length + " MODIFIED " + this.collectionName);
                callback.onDocumentModified(modifiedDocs);
            }
            if (deletedDocs.length > 0) {
                if (FirebaseFirestoreDAO.VERBOSE) console.log("firebase gave us " + deletedDocs.length + " DELETED " + this.collectionName);
                callback.onDocumentDeleted(deletedDocs);
            }
        });
    }
}