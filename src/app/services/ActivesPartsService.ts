import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { IPart, IPartId } from '../domain/icurrentpart';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { assert, Utils } from '../utils/utils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
/*
 * This service handles active parts (i.e., being played, waiting for a player, ...),
 * and is used by the server component and game component.
 */
export class ActivesPartsService implements OnDestroy {

    private readonly activePartsBS: BehaviorSubject<IPartId[]>;

    private readonly activePartsObs: Observable<IPartId[]>;

    private activeParts: IPartId[] = []

    private unsubscribe: MGPOptional<() => void> = MGPOptional.empty();

    constructor(private readonly partDAO: PartDAO) {
        this.activePartsBS = new BehaviorSubject<IPartId[]>([]);
        this.activePartsObs = this.activePartsBS.asObservable();
        this.startObserving();
    }
    public getActivePartsObs(): Observable<IPartId[]> {
        return this.activePartsObs;
    }
    public ngOnDestroy(): void {
        this.stopObserving();
    }
    public startObserving(): void {
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
        this.unsubscribe = MGPOptional.of(this.partDAO.observeActivesParts(partObserver));
        this.activePartsObs.subscribe((activesParts: IPartId[]) => {
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
            const playerZero: string = Utils.getNonNullable(part.doc).playerZero;
            const playerOne: string | undefined = Utils.getNonNullable(part.doc).playerOne;
            if (user === playerZero || user === playerOne) {
                return true;
            }
        }
        return false;
    }
}
