import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { ICurrentPartId, IPart } from '../domain/icurrentpart';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { assert } from '../utils/utils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
/*
 * This service handles parts being played, and is used by the server component and game component.
 */
export class ActivesPartsService implements OnDestroy {

    private readonly activePartsBS: BehaviorSubject<ICurrentPartId[]>;

    private readonly activePartsObs: Observable<ICurrentPartId[]>;

    private activeParts: ICurrentPartId[] = []

    private unsubscribe: MGPOptional<() => void> = MGPOptional.empty();

    constructor(private readonly partDao: PartDAO) {
        this.activePartsBS = new BehaviorSubject<ICurrentPartId[]>([]);
        this.activePartsObs = this.activePartsBS.asObservable();
        this.startObserving();
    }
    public getActivePartsObs(): Observable<ICurrentPartId[]> {
        return this.activePartsObs;
    }
    public ngOnDestroy(): void {
        this.stopObserving();
    }
    public startObserving(): void {
        const onDocumentCreated: (createdParts: ICurrentPartId[]) => void = (createdParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activePartsBS.value.concat(...createdParts);
            this.activePartsBS.next(result);
        };
        const onDocumentModified: (modifiedParts: ICurrentPartId[]) => void = (modifiedParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activePartsBS.value;
            for (const p of modifiedParts) {
                result.forEach((part: ICurrentPartId) => {
                    if (part.id === p.id) part.doc = p.doc;
                });
            }
            this.activePartsBS.next(result);
        };
        const onDocumentDeleted: (deletedDocs: ICurrentPartId[]) => void = (deletedDocs: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = [];
            const deletedIds: string[] = deletedDocs.map((doc: ICurrentPartId) => doc.id);
            for (const p of this.activePartsBS.value) {
                if (!deletedIds.includes(p.id)) {
                    result.push(p);
                }
            }
            this.activePartsBS.next(result);
        };
        const partObserver: FirebaseCollectionObserver<IPart> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = MGPOptional.of(this.partDao.observeActivesParts(partObserver));
        this.activePartsObs.subscribe((activesParts: ICurrentPartId[]) => {
            this.activeParts = activesParts;
        });
    }
    public stopObserving(): void {
        assert(this.unsubscribe.isPresent(), 'Cannot stop observing actives part when you have not started observing');
        this.activePartsBS.next([]);
        this.unsubscribe.get()();
    }
    public hasActivePart(user: string): boolean {
        for (const part of this.activeParts) {
            const playerZero: string = part.doc.playerZero;
            const playerOne: string | undefined = part.doc.playerOne;
            if (user === playerZero || user === playerOne) {
                return true;
            }
        }
        return false;
    }
}
