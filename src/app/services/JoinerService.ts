import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IJoiner} from '../domain/ijoiner';
import {AngularFirestoreDocument} from 'angularfire2/firestore';
import {JoinerDAO} from '../dao/JoinerDAO';

@Injectable({
	providedIn : 'root'
})
export class JoinerService {

	private observedJoinerDoc: AngularFirestoreDocument<IJoiner> = null;

	constructor(private joinerDao: JoinerDAO) {}

	getJoinerObservable(docId: string): Observable<IJoiner> {
		this.observedJoinerDoc = this.joinerDao.getJoinerDocById(docId);
		return this.joinerDao.getJoinerObservableById(docId);
	}

	removePlayerFromJoinerList(userName: string) {
		this.observedJoinerDoc.ref.get()
			.then(joinersDoc => {
				const joiners = joinersDoc.data() as IJoiner;
				const joinersList: string[] = joiners.candidatesNames;
				const index = joinersList.indexOf(userName);
				joinersList.splice(index, 1);
				this.observedJoinerDoc.update({candidatesNames: joinersList});
			});
	}

	deleteJoinerDoc(): Promise<void> {
		return this.observedJoinerDoc.delete();
	}

	acceptConfig(): Promise<void> {
		return this.observedJoinerDoc.update({ partStatus: 3 });
	}

	changeChosenPlayer(chosenPlayersPseudo: string): Promise<void> {
		return this.observedJoinerDoc.ref.get()
			.then(joinersDoc => {
				const joiners = joinersDoc.data() as IJoiner;
				const candidatesNames: string[] = joiners.candidatesNames;
				const oldChosenPlayer: string = joiners.chosenPlayer;
				if (oldChosenPlayer !== '') {
					const index = candidatesNames.indexOf(chosenPlayersPseudo);
					candidatesNames.splice(index, 1, oldChosenPlayer);
					// suppress the old candidate from the list
					// then put in his place the old chosen player, so he don't just disappear
				}
				this.observedJoinerDoc.update({
					partStatus: 1,
					candidatesNames: candidatesNames,
					chosenPlayer: chosenPlayersPseudo});
			});
	}

}
