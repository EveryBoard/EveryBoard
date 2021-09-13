import { assert } from '../utils/utils';

export class FirebaseCollectionObserver<T> {
    public constructor(public onDocumentCreated: NonNullable<(createdDocIds: {doc: T, id: string}[]) => void>,
                       public onDocumentModified: NonNullable<(modifiedDocIds: {doc: T, id: string}[]) => void>,
                       public onDocumentDeleted: NonNullable<(deletedDocIds: {doc: T, id: string}[]) => void>,
    ) {
        assert(onDocumentCreated != null, 'Method onDocumentCreated must be defined.');
        assert(onDocumentModified != null, 'Method onDocumentModified must be defined.');
        assert(onDocumentDeleted != null, 'Method onDocumentDeleted must be defined.');
    }
}
