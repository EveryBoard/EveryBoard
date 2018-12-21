import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IJoiner, IJoinerId} from '../domain/ijoiner';
import {AngularFirestoreDocument} from 'angularfire2/firestore';
import {JoinerDAO} from '../dao/JoinerDAO';

@Injectable({
	providedIn : 'root'
})
export class JoinerService {

	private followedJoinerId: string;
	private followedJoinerDoc: AngularFirestoreDocument<IJoiner> = null; // TODO : est-ce bien correct point de vue couches DAO/SERVICE?
	private followedJoinerObservable: Observable<IJoinerId>;

	constructor(private joinerDao: JoinerDAO) {}

	startObservingJoiner(docId: string) {
		if (this.followedJoinerDoc != null) {
			this.stopObservingPart();
		}
		this.followedJoinerId = docId;
		this.followedJoinerDoc = this.joinerDao.getJoinerDocById(docId);
		this.followedJoinerObservable = this.joinerDao.getJoinerIdObservableById(docId);
	}

	getJoinerIdObservable(): Observable<IJoinerId> {
		return this.followedJoinerObservable;
	}

	removePlayerFromJoiningPage(userName: string) {
		this.followedJoinerDoc.ref.get()
			.then(joinersDoc => {
				const joiners = joinersDoc.data() as IJoiner;
				const joinersList: string[] = joiners.candidatesNames;
				const indexLeaver = joinersList.indexOf(userName);
				let chosenPlayer = joiners.chosenPlayer;
				let partStatus = joiners.partStatus;
				if (indexLeaver >= 0) {
					// l
					joinersList.splice(indexLeaver, 1);
				} if (joiners.chosenPlayer === userName) {
					// if the chosenPlayer leave, we're back to partStatus 0 (waiting for a chosenPlayer)
					chosenPlayer = '';
					partStatus = 0;
				}
				this.followedJoinerDoc.update({
					partStatus: partStatus,
					candidatesNames: joinersList,
					chosenPlayer: chosenPlayer
				});
			});
	}

	cancelGame(): Promise<void> {
		return this.followedJoinerDoc.delete().then(
			onfullfilled => this.stopObservingPart());
	}

	setChosenPlayer(chosenPlayersPseudo: string): Promise<void> {
		return this.followedJoinerDoc.ref.get()
			.then(joinersDoc => {
				const joiners = joinersDoc.data() as IJoiner;
				const candidatesNames: string[] = joiners.candidatesNames;
				const chosenPlayerIndex = candidatesNames.indexOf(chosenPlayersPseudo);
				if (chosenPlayerIndex >= 0) {
					// if user is still present, take him off the candidate list
					candidatesNames.splice(chosenPlayerIndex, 1);
					const oldChosenPlayer: string = joiners.chosenPlayer;
					if (oldChosenPlayer !== '') {
						// if there is a previous chosenPlayer, put him in the candidates list
						candidatesNames.push(oldChosenPlayer);
						// so he don't just disappear
					}
					this.followedJoinerDoc.update({
						partStatus: 1,
						candidatesNames: candidatesNames,
						chosenPlayer: chosenPlayersPseudo
					});
				}
			});
	}

	proposeConfig(timeout: number, firstPlayer: string): Promise<void> {
		return this.followedJoinerDoc.update({
			partStatus: 2,
			timeoutMinimalDuration: timeout,
			firstPlayer: firstPlayer
		});
	}

	acceptConfig(): Promise<void> {
		return this.followedJoinerDoc.update({ partStatus: 3 });
	}

	getJoinerByPartId(partId: string): Promise<IJoiner> {
		return this.joinerDao.getJoinerDocById(partId).ref.get().then( docRef => {
			const joiner = docRef.data() as IJoiner;
			return joiner;
		});
	}

	stopObservingPart() {
		this.followedJoinerId = null;
		this.followedJoinerDoc = null;
		this.followedJoinerObservable = null;
	}

}
