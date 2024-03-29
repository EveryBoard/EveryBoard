import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';

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
        const onDocumentCreated: (createdParts: PartDocument[]) => void = (createdParts: PartDocument[]) => {
            activeParts = activeParts.concat(...createdParts);
            callback(activeParts);
        };
        const onDocumentModified: (modifiedParts: PartDocument[]) => void = (modifiedParts: PartDocument[]) => {
            const result: PartDocument[] = activeParts;
            for (const modifiedPart of modifiedParts) {
                result.forEach((part: PartDocument) => {
                    if (part.id === modifiedPart.id) part.data = modifiedPart.data;
                });
            }
            activeParts = result;
            callback(activeParts);
        };
        const onDocumentDeleted: (deletedDocIds: PartDocument[]) => void = (deletedDocs: PartDocument[]) => {
            const result: PartDocument[] = [];
            for (const activePart of activeParts) {
                if (deletedDocs.every((part: PartDocument) => part.id !== activePart.id)) {
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
