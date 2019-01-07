import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IJoiner, IJoinerId} from '../domain/ijoiner';
import {JoinerDAO} from '../dao/JoinerDAO';

@Injectable({
	providedIn: 'root'
})
export class JoinerService {

	private followedJoinerId: string;
	private followedJoinerObservable: Observable<IJoinerId>;

	constructor(private joinerDao: JoinerDAO) {
	}

	startObservingJoiner(docId: string) {
		if (this.followedJoinerId == null) {
			console.log('[start watching joiner ' + docId);
			this.followedJoinerId = docId;
			this.followedJoinerObservable = this.joinerDao.getJoinerIdObservableById(docId);
		} else if (docId === this.followedJoinerId) {
			console.log('already observing this part (' + docId + ')');
		} else {
			alert('we were already observing ' + this.followedJoinerId + ' then you ask to watch' + docId + 'you are gross (no I\'m bugged)');
			this.stopObservingJoiner();
			this.startObservingJoiner(docId);
		}
	}

	getJoinerIdObservable(): Observable<IJoinerId> {
		return this.followedJoinerObservable;
	}

	removePlayerFromJoiningPage(userName: string) {
		this.joinerDao
			.readJoinerById(this.followedJoinerId)
			.then(joiner => {
				const joinersList: string[] = joiner.candidatesNames;
				const indexLeaver = joinersList.indexOf(userName);
				let chosenPlayer = joiner.chosenPlayer;
				let partStatus = joiner.partStatus;
				if (indexLeaver >= 0) {
					// l
					joinersList.splice(indexLeaver, 1);
				}
				if (joiner.chosenPlayer === userName) {
					// if the chosenPlayer leave, we're back to partStatus 0 (waiting for a chosenPlayer)
					chosenPlayer = '';
					partStatus = 0;
				}
				this.joinerDao
					.updateJoinerById(this.followedJoinerId, {
						partStatus: partStatus,
						candidatesNames: joinersList,
						chosenPlayer: chosenPlayer
					});
			});
	}

	cancelGame(): Promise<void> {
		return this.joinerDao
			.deletePartById(this.followedJoinerId)
			.then(onfullfilled => this.stopObservingJoiner());
	}

	setChosenPlayer(chosenPlayersPseudo: string): Promise<void> {
		return this.joinerDao
			.readJoinerById(this.followedJoinerId)
			.then(joiner => {
				const candidatesNames: string[] = joiner.candidatesNames;
				const chosenPlayerIndex = candidatesNames.indexOf(chosenPlayersPseudo);
				if (chosenPlayerIndex >= 0) {
					// if user is still present, take him off the candidate list
					candidatesNames.splice(chosenPlayerIndex, 1);
					const oldChosenPlayer: string = joiner.chosenPlayer;
					if (oldChosenPlayer !== '') {
						// if there is a previous chosenPlayer, put him in the candidates list
						candidatesNames.push(oldChosenPlayer);
						// so he don't just disappear
					}
					this.joinerDao.updateJoinerById(this.followedJoinerId, {
						partStatus: 1,
						candidatesNames: candidatesNames,
						chosenPlayer: chosenPlayersPseudo
					});
				}
			});
	}

	proposeConfig(timeout: number, firstPlayer: string): Promise<void> {
		return this.joinerDao.updateJoinerById(this.followedJoinerId, {
			partStatus: 2,
			timeoutMinimalDuration: timeout,
			firstPlayer: firstPlayer
		});
	}

	acceptConfig(): Promise<void> {
		return this.joinerDao
			.updateJoinerById(this.followedJoinerId, {partStatus: 3});
	}

	getJoinerByPartId(partId: string): Promise<IJoiner> {
		return this.joinerDao.readJoinerById(partId);
	}

	stopObservingJoiner() {
		if (this.followedJoinerId == null) {
			console.log('we already stop watching doc');
		} else {
			console.log('stopped watching joiner ' + this.followedJoinerId + ']');
			this.followedJoinerId = null;
			this.followedJoinerObservable = null;
		}
	}

	// DELEGATE

	set(id: string, joiner: IJoiner): Promise<void> {
		return this.joinerDao.set(id, joiner);
	}

}
