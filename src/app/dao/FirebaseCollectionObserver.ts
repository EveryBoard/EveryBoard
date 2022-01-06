import { FirebaseDocumentWithId } from './FirebaseFirestoreDAO';

export class FirebaseCollectionObserver<T> {
    public constructor(public onDocumentCreated: (createdDocs: FirebaseDocumentWithId<T>[]) => void,
                       public onDocumentModified: (modifiedDocs: FirebaseDocumentWithId<T>[]) => void,
                       public onDocumentDeleted: (deletedDocIds: FirebaseDocumentWithId<T>[]) => void,
    ) {
    }
}
