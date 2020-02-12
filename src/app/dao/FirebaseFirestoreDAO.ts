import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";

export abstract class FirebaseFirestoreDAO<T, PT> {
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
        return this.afs.collection(this.collectionName).doc<T>(id).ref.update(modification);
    }
    public delete(messageId: string): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(messageId).ref.delete();
    }
    public set(id: string, element: T): Promise<void> {
        return this.afs.collection(this.collectionName).doc<T>(id).set(element);
    }
}