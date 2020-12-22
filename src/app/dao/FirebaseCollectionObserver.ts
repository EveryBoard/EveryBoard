export class FirebaseCollectionObserver<T> {
    public onDocumentCreated: (createdDocIds: {doc: T, id: string}[]) => void;

    public onDocumentModified: (modifiedDocIds: {doc: T, id: string}[]) => void;

    public onDocumentDeleted: (deletedDocIds: {doc: T, id: string}[]) => void;
}
