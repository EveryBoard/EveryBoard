import { FirebaseJSONObject } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { FirebaseDocument } from '../FirebaseFirestoreDAO';

describe('FirebaseCollectionObserver', () => {
    it('should provide default functions that do not throw', () => {
        // Given a FirebaseCollectionObserver with no provided callback
        const observer: FirebaseCollectionObserver<FirebaseJSONObject> = new FirebaseCollectionObserver();
        // When calling each callback
        // Then it should never throw
        const docs: FirebaseDocument<FirebaseJSONObject>[] = [{ id: '1', data: {} }];
        expect(() => observer.onDocumentCreated(docs)).not.toThrowError();
        expect(() => observer.onDocumentModified(docs)).not.toThrowError();
        expect(() => observer.onDocumentDeleted(docs)).not.toThrowError();
    });
});
