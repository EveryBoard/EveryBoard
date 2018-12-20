import {Observable} from 'rxjs';
import {ICurrentPart} from '../domain/icurrentpart';
import {PartDAO} from '../dao/PartDAO';
import {AngularFirestoreDocument} from 'angularfire2/firestore';
import {Injectable} from '@angular/core';
import {IJoiner} from '../domain/ijoiner';

@Injectable({
	providedIn : 'root'
})
export class PartService {

	private observedPartDoc: AngularFirestoreDocument<ICurrentPart> = null;

	constructor(private partDao: PartDAO) {}

	getPartObservable(docId: string): Observable<ICurrentPart> {
		this.setObservedPartDoc(docId);
		return this.partDao.getPartObservableById(docId);
	}

	setObservedPartDoc(docId: string) {
		this.observedPartDoc = this.partDao.getPartDocById(docId);
	}

	startGameWithConfig(joiner: IJoiner): Promise<void> {
		let firstPlayer = joiner.creator;
		let secondPlayer = joiner.chosenPlayer;
		if (joiner.firstPlayer === '1') {
			// the opposite config is planned
			secondPlayer = joiner.creator;
			firstPlayer = joiner.chosenPlayer;
		}
		return this.observedPartDoc.update({
			playerZero: firstPlayer,
			playerOne: secondPlayer,
			turn: 0,
			beginning: Date.now()
		});
	}

	cancelGame(): Promise<void> {
		// cancel the currently observed game
		return this.observedPartDoc.delete();
	}

}
