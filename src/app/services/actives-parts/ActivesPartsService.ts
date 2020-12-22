import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PartDAO} from '../../dao/part/PartDAO';
import {ICurrentPartId, ICurrentPart} from '../../domain/icurrentpart';
import {FirebaseCollectionObserver} from '../../dao/FirebaseCollectionObserver';

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
    public startObserving() {
        const partObserver: FirebaseCollectionObserver<ICurrentPart> = new FirebaseCollectionObserver();
        partObserver.onDocumentModified = (modifiedParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activesPartsBS.value;
            for (const p of modifiedParts) {
                result.forEach((part) => {
                    if (part.id === p.id) part.doc = p.doc;
                });
            }
            this.activesPartsBS.next(result);
        };
        partObserver.onDocumentCreated = (createdParts: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = this.activesPartsBS.value.concat(...createdParts);
            this.activesPartsBS.next(result);
        };
        partObserver.onDocumentDeleted = (deletedDocs: ICurrentPartId[]) => {
            const result: ICurrentPartId[] = [];
            const deletedIds: string[] = deletedDocs.map((doc) => doc.id);
            for (const p of this.activesPartsBS.value) {
                if (!deletedIds.includes(p.id)) {
                    result.push(p);
                }
            }
            this.activesPartsBS.next(result);
        };
        this.unsubscribe = this.partDao.observeActivesParts(partObserver);
    }
    public stopObserving() {
        if (this.unsubscribe == null) throw new Error('Canno\'t stop observing actives part when you have not started observing');
        this.activesPartsBS.next([]);
        this.unsubscribe();
    }
}
