import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument } from '../dao/FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
/*
 * This service handles non-finished games, and is used by the server component
 * and game component. You must start observing when you need to observe parts,
 * and stop observing when you're done.
 */
export class ActivePartsService {

    public constructor(private readonly partDAO: PartDAO) {
    }
    public subscribeToActiveParts(callback: (parts: PartDocument[]) => void): Subscription {
        let activeParts: PartDocument[] = [];
        const onDocumentCreated: (createdDocs: FirestoreDocument<Part>[]) => void =
            (createdDocs: FirestoreDocument<Part>[]) => {
                for (const createdDoc of createdDocs) {
                    activeParts.push(new PartDocument(createdDoc.id, createdDoc.data));
                }
                callback(activeParts);
            };
        const onDocumentModified: (modifiedDocs: FirestoreDocument<Part>[]) => void =
            (modifiedDocs: FirestoreDocument<Part>[]) => {
                const result: PartDocument[] = activeParts;
                for (const modifiedDoc of modifiedDocs) {
                    result.forEach((doc: FirestoreDocument<Part>) => {
                        if (doc.id === modifiedDoc.id) doc.data = modifiedDoc.data;
                    });
                }
                activeParts = result;
                callback(activeParts);
            };
        const onDocumentDeleted: (deletedDocIds: FirestoreDocument<Part>[]) => void =
            (deletedDocs: FirestoreDocument<Part>[]) => {
                const result: PartDocument[] = [];
                for (const activePart of activeParts) {
                    if (deletedDocs.every((part: FirestoreDocument<Part>) => part.id !== activePart.id)) {
                        result.push(activePart);
                    }
                }
                activeParts = result;
                callback(activeParts);
            };
        const partObserver: FirestoreCollectionObserver<Part> =
            new FirestoreCollectionObserver(onDocumentCreated, onDocumentModified, onDocumentDeleted);
        return this.partDAO.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], partObserver);
    }
}
