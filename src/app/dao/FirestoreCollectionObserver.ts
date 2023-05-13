import { FirestoreDocument } from './FirestoreDAO';

export class FirestoreCollectionObserver<T> {
    public constructor(public onDocumentCreated: (createdDocs: FirestoreDocument<T>[]) => void,
                       public onDocumentModified: (modifiedDocs: FirestoreDocument<T>[]) => void,
                       public onDocumentDeleted: (deletedDocIds: FirestoreDocument<T>[]) => void,
    ) {
    }
}
