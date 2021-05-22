import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PartDAO } from '../dao/PartDAO';
import { ICurrentPartId, ICurrentPart } from '../domain/icurrentpart';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root',
})
export class ActivesPartsService {
    /* Actives Parts service
     * this service is used by the Server Component
     */

    private activesPartsBS: BehaviorSubject<ICurrentPartId[]> = new BehaviorSubject<ICurrentPartId[]>([]);

    public activesPartsObs: Observable<ICurrentPartId[]> = this.activesPartsBS.asObservable();

    private unsubscribe: () => void;

    constructor(private partDao: PartDAO) {
    }
    public startObserving(): void {
        const onDocumentCreated: (createdParts: ICurrentPartId[]) => void = (createdParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activesPartsBS.value.concat(...createdParts);
            this.activesPartsBS.next(result);
        };
        const onDocumentModified: (modifiedParts: ICurrentPartId[]) => void = (modifiedParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activesPartsBS.value;
            for (const p of modifiedParts) {
                result.forEach((part: ICurrentPartId) => {
                    if (part.id === p.id) part.doc = p.doc;
                });
            }
            this.activesPartsBS.next(result);
        };
        const onDocumentDeleted: (deletedDocs: ICurrentPartId[]) => void = (deletedDocs: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = [];
            const deletedIds: string[] = deletedDocs.map((doc: ICurrentPartId) => doc.id);
            for (const p of this.activesPartsBS.value) {
                if (!deletedIds.includes(p.id)) {
                    result.push(p);
                }
            }
            this.activesPartsBS.next(result);
        };
        const partObserver: FirebaseCollectionObserver<ICurrentPart> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = this.partDao.observeActivesParts(partObserver);
    }
    public stopObserving(): void {
        if (this.unsubscribe == null) {
            throw new Error('Cannot stop observing actives part when you have not started observing');
        }
        this.activesPartsBS.next([]);
        this.unsubscribe();
    }
}
