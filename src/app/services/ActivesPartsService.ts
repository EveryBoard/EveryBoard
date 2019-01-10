import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PartDAO} from '../dao/PartDAO';
import {ICurrentPartId} from '../domain/icurrentpart';

@Injectable({
	providedIn: 'root'
})
export class ActivesPartsService {
	/* Actives Parts service
	 * this service is used by the Server Component
	 */
	private activesPartsBS = new BehaviorSubject<ICurrentPartId[]>([]);

	activesPartsObs = this.activesPartsBS.asObservable();

	private unsubscribe: () => void;

	constructor(private partDao: PartDAO) {}

	startObserving() {
		this.unsubscribe = this.partDao
			.observeActivesParts(activesParts =>
				this.activesPartsBS.next(activesParts));
	}

	stopObserving() {
		this.unsubscribe();
	}

}
