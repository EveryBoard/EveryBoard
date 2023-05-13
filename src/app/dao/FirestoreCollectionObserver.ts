import { FirestoreDocument } from './FirestoreDAO';

export class FirestoreCollectionObserver<T> {
    public constructor(public onDocumentCreated: (createdDocs: FirestoreDocument<T>[]) => Promise<void>,
                       public onDocumentModified: (modifiedDocs: FirestoreDocument<T>[]) => Promise<void>,
                       public onDocumentDeleted: (deletedDocIds: FirestoreDocument<T>[]) => Promise<void>,
    ) {
    }
}
