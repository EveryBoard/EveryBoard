import { FirebaseDocument } from './FirebaseFirestoreDAO';

export class FirebaseCollectionObserver<T> {
    public constructor(public onDocumentCreated: (createdDocs: FirebaseDocument<T>[]) => void,
                       public onDocumentModified: (modifiedDocs: FirebaseDocument<T>[]) => void,
                       public onDocumentDeleted: (deletedDocIds: FirebaseDocument<T>[]) => void,
    ) {
    }
}
