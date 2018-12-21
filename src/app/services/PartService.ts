import {Injectable} from '@angular/core';
import {AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs';

import {PartDAO} from '../dao/PartDAO';

import {ICurrentPart} from '../domain/icurrentpart';
import {IJoiner} from '../domain/ijoiner';

import {JoinerService} from './JoinerService';

@Injectable({
	providedIn : 'root'
})
export class PartService {

	private followedPartId: string;
	private followedPartDoc: AngularFirestoreDocument<ICurrentPart> = null; // TODO : est-ce bien correct point de vue couches DAO/SERVICE?
	private followedPartObservable: Observable<ICurrentPart>;

	constructor(private partDao: PartDAO,
				private joinerService: JoinerService) {}

	startObservingPart(docId: string) {
		this.joinerService.startObservingJoiner(docId);
		if (this.followedPartDoc != null) {
			this.stopObservingPart();
		}
		this.followedPartId = docId;
		this.followedPartDoc = this.partDao.getPartDocById(docId);
		this.followedPartObservable = this.partDao.getPartObservableById(docId);
	}

	getPartId(): string {
		return this.followedPartId;
	}

	getPartObservable(): Observable<ICurrentPart> {
		return this.followedPartObservable;
	}

	startGameWithConfig(joiner: IJoiner): Promise<void> {
		let firstPlayer = joiner.creator;
		let secondPlayer = joiner.chosenPlayer;
		if (joiner.firstPlayer === '1') {
			// the opposite config is planned
			secondPlayer = joiner.creator;
			firstPlayer = joiner.chosenPlayer;
		}
		return this.followedPartDoc.update({
			playerZero: firstPlayer,
			playerOne: secondPlayer,
			turn: 0,
			beginning: Date.now()
		});
	}

	cancelGame(): Promise<void> {
		// cancel the currently observed game
		return this.followedPartDoc.delete().then(
			onfullfilled => this.stopObservingPart());
	}

	stopObservingPart() {
		this.followedPartId = null;
		this.followedPartDoc = null;
		this.followedPartObservable = null;
	}

}
