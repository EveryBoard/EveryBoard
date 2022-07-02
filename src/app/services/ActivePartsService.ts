import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@angular/fire/firestore';
import { FirestoreDocument } from '../dao/FirestoreDAO';

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
export class ActivePartsService implements OnDestroy {

    private readonly activePartsBS: BehaviorSubject<PartDocument[]>;

    private readonly activePartsObs: Observable<PartDocument[]>;

    private unsubscribe: MGPOptional<Unsubscribe> = MGPOptional.empty();

    constructor(private readonly partDAO: PartDAO) {
        this.activePartsBS = new BehaviorSubject<PartDocument[]>([]);
        this.activePartsObs = this.activePartsBS.asObservable();
    }
    public subscribeToActiveParts(callback: (parts: PartDocument[]) => void): Subscription {
        return this.activePartsObs.subscribe(callback);
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
        const partObserver: FirestoreCollectionObserver<Part> =
            new FirestoreCollectionObserver(onDocumentCreated, onDocumentModified, onDocumentDeleted);
        this.unsubscribe = MGPOptional.of(this.observeActiveParts(partObserver));
    }
    public stopObserving(): void {
        if (this.unsubscribe.isPresent()) {
            this.unsubscribe.get()();
            this.unsubscribe = MGPOptional.empty();
            this.activePartsBS.next([]);
        }
    }
    public ngOnDestroy(): void {
        assert(this.unsubscribe.isAbsent(), 'ActivePartsService should have unsubscribed before being destroyed');
    }
    public observeActiveParts(callback: FirestoreCollectionObserver<Part>): () => void {
        return this.partDAO.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
    public async userHasActivePart(username: string): Promise<boolean> {
        // This can be simplified into a simple query once part.playerZero and part.playerOne are in an array
        const userIsFirstPlayer: FirestoreDocument<Part>[] = await this.partDAO.findWhere([
            ['playerZero', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        const userIsSecondPlayer: FirestoreDocument<Part>[] = await this.partDAO.findWhere([
            ['playerOne', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        return userIsFirstPlayer.length > 0 || userIsSecondPlayer.length > 0;
    }
}
