export class FirebaseCollectionObserver<T> {
    public constructor(
        public onDocumentCreated: (createdDocIds: {doc: T, id: string}[]) => void,
        public onDocumentModified: (modifiedDocIds: {doc: T, id: string}[]) => void,
        public onDocumentDeleted: (deletedDocIds: {doc: T, id: string}[]) => void,
    ) {
        if (onDocumentCreated == null) throw new Error('Method onDocumentCreated must be defined.');
        if (onDocumentModified == null) throw new Error('Method onDocumentModified must be defined.');
        if (onDocumentDeleted == null) throw new Error('Method onDocumentDeleted must be defined.');
    }
}
