import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { Part, PartDocument } from '../domain/Part';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { assert } from '../utils/utils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    // This ensures that any component using this service has its unique ActivePartsService
    // It prevents multiple subscriptions/unsubscriptions issues.
    providedIn: 'any',
})
/*
 * This service handles non-finished games, and is used by the server component
 * and game component. You must start observing when you need to observe parts,
 * and stop observing when you're done.
 */
export class ActivePartsService {

    private readonly activePartsBS: BehaviorSubject<PartDocument[]>;

    private readonly activePartsObs: Observable<PartDocument[]>;

    private unsubscribe: MGPOptional<() => void> = MGPOptional.empty();

    constructor(private readonly partDAO: PartDAO) {
        this.activePartsBS = new BehaviorSubject<PartDocument[]>([]);
        this.activePartsObs = this.activePartsBS.asObservable();
    }
    public getActivePartsObs(): Observable<PartDocument[]> {
        return this.activePartsObs;
    }
    public startObserving(): void {
        assert(this.unsubscribe.isAbsent(), 'ActivePartsService: already observing');
        const onDocumentCreated: (createdParts: PartDocument[]) => void = (createdParts: PartDocument[]) => {
            const result: PartDocument[] = this.activePartsBS.value.concat(...createdParts);
            this.activePartsBS.next(result);
        };
        const onDocumentModified: (modifiedParts: PartDocument[]) => void = (modifiedParts: PartDocument[]) => {
            const result: PartDocument[] = this.activePartsBS.value;
            for (const p of modifiedParts) {
                result.forEach((part: PartDocument) => {
                    if (part.id === p.id) part.data = p.data;
                });
            }
            this.activePartsBS.next(result);
        };
        const onDocumentDeleted: (deletedDocIds: PartDocument[]) => void = (deletedDocs: PartDocument[]) => {
            const result: PartDocument[] = [];
            for (const p of this.activePartsBS.value) {
                if (!deletedDocs.some((part: PartDocument) => part.id === p.id)) {
                    result.push(p);
                }
            }
            this.activePartsBS.next(result);
        };
        const partObserver: FirebaseCollectionObserver<Part> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = MGPOptional.of(this.partDAO.observeActiveParts(partObserver));
    }
    public stopObserving(): void {
        assert(this.unsubscribe.isPresent(), 'Cannot stop observing active parts when you have not started observing');
        this.activePartsBS.next([]);
        this.unsubscribe.get()();
    }
}
