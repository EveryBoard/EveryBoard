import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { IPart, IPartId } from '../domain/icurrentpart';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { assert } from '../utils/utils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    // This ensures that any component using this service has its unique ActivePartsService
    // It prevents multiple subscriptions/unsubscriptions issues.
    providedIn: 'any',
})
/*
 * This service handles active parts (i.e., being played, waiting for a player),
 * and is used by the server component and game component. You must start
 * observing when you need to observe parts, and stop observing when you're
 * done.
 */
export class ActivePartsService {

    private readonly activePartsBS: BehaviorSubject<IPartId[]>;

    private readonly activePartsObs: Observable<IPartId[]>;

    private unsubscribe: MGPOptional<() => void> = MGPOptional.empty();

    constructor(private readonly partDAO: PartDAO) {
        this.activePartsBS = new BehaviorSubject<IPartId[]>([]);
        this.activePartsObs = this.activePartsBS.asObservable();
    }
    public getActivePartsObs(): Observable<IPartId[]> {
        return this.activePartsObs;
    }
    public startObserving(): void {
        assert(this.unsubscribe.isAbsent(), 'ActivePartsService: already observing');
        const onDocumentCreated: (createdParts: IPartId[]) => void = (createdParts: IPartId[]) => {
            const result: IPartId[] = this.activePartsBS.value.concat(...createdParts);
            this.activePartsBS.next(result);
        };
        const onDocumentModified: (modifiedParts: IPartId[]) => void = (modifiedParts: IPartId[]) => {
            const result: IPartId[] = this.activePartsBS.value;
            for (const p of modifiedParts) {
                result.forEach((part: IPartId) => {
                    if (part.id === p.id) part.doc = p.doc;
                });
            }
            this.activePartsBS.next(result);
        };
        const onDocumentDeleted: (deletedDocIds: IPartId[]) => void = (deletedDocs: IPartId[]) => {
            const result: IPartId[] = [];
            for (const p of this.activePartsBS.value) {
                if (!deletedDocs.some((part: IPartId) => part.id === p.id)) {
                    result.push(p);
                }
            }
            this.activePartsBS.next(result);
        };
        const partObserver: FirebaseCollectionObserver<IPart> =
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
