import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {IJoiner, IJoinerId, PIJoiner} from '../domain/ijoiner';
import {JoinerDAO} from '../dao/JoinerDAO';

@Injectable({
	providedIn: 'root'
})
export class JoinerService {

	private followedJoinerId: string;
	private followedJoinerObs: Observable<IJoinerId>;
	private followedJoinerSub: Subscription;

	constructor(private joinerDao: JoinerDAO) {
	}

	startObserving(joinerId: string, callback: (iJoiner: IJoinerId) => void) {
		if (this.followedJoinerId == null) {
			console.log('[start watching joiner ' + joinerId);
			this.followedJoinerId = joinerId;
			this.followedJoinerObs = this.joinerDao.getJoinerObsById(joinerId);
			this.followedJoinerSub = this.followedJoinerObs
				.subscribe(onFullFilled => callback(onFullFilled));
		} else if (joinerId === this.followedJoinerId) {
			console.log('!!!already observing this part (' + joinerId + ')');
		} else {
			alert('!!!we were already observing ' + this.followedJoinerId + ' then you ask to watch' + joinerId + 'you are gross (no I\'m bugged)');
			this.stopObserving();
			this.startObserving(joinerId, callback);
		}
	}

	joinGame(partId: string, userName: string): Promise<void> {
		console.log('JoinerService : try to join ' + userName + ' to ' + partId);
		return new Promise((resolve, reject) => {
			this.joinerDao
				.readJoinerById(partId)
				.then(joiner => {
					if (!joiner) {
						reject(joiner);
					}
					const joinerList: string[] = joiner.candidatesNames;
					if (!joinerList.includes(userName) &&
						(userName !== joiner.creator)) {
						joinerList[joinerList.length] = userName;
						this.joinerDao
							.updateJoinerById(partId, {candidatesNames: joinerList})
							.then(onFullFilled => resolve(onFullFilled))
							.catch(onRejected => reject(onRejected));
					} else {
						// the user was already in the lobby/joining Part
						resolve();
					}
				})
				.catch(onRejected => reject(onRejected));
		});
	}

	cancelJoining(userName: string): Promise<void> {
		console.log('JoinerService.remove ' + userName + ' from joining page ' + this.followedJoinerId);
		return new Promise((resolve, reject) => {
			if (this.followedJoinerId == null) {
				console.log('cannot cancel joining when not following a part');
				reject();
			} else {
				this.joinerDao
					.readJoinerById(this.followedJoinerId)
					.then(joiner => {
						if (joiner == null || joiner === undefined) {
							reject(joiner);
						} else {
							const joinersList: string[] = joiner.candidatesNames;
							const indexLeaver = joinersList.indexOf(userName);
							let chosenPlayer = joiner.chosenPlayer;
							let partStatus = joiner.partStatus;
							if (indexLeaver >= 0) {
								joinersList.splice(indexLeaver, 1);
							}
							if (joiner.chosenPlayer === userName) {
								// if the chosenPlayer leave, we're back to partStatus 0 (waiting for a chosenPlayer)
								chosenPlayer = '';
								partStatus = 0;
							}
							const modification: PIJoiner = {
								chosenPlayer: chosenPlayer,
								partStatus: partStatus,
								candidatesNames: joinersList
							};
							this.joinerDao
								.updateJoinerById(this.followedJoinerId, modification)
								.then(onFullFilled => resolve(onFullFilled))
								.catch(onRejected => reject(onRejected));
						}
					})
					.catch(onRejected => reject(onRejected));
			}
		});
	}

	deleteJoiner(): Promise<void> {
		console.log('JoinerService.deleteJoiner ' + this.followedJoinerId);
		return new Promise((resolve, reject) => {
			if (this.followedJoinerId == null) {
				console.log('followed joiner id is null');
				reject();
			}
			this.joinerDao
				.deleteById(this.followedJoinerId)
				.then(onFullFilled => resolve(onFullFilled))
				.catch(onRejected => reject(onRejected));
		});
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
		if (this.followedJoinerId == null) {
			console.log('BUG GOING TO HAPPEND cause acceptConfig when no observing Joiner !!');
		}
		console.log('JoinerService :: let s accept config from ' + this.followedJoinerId);
		return this.joinerDao
			.updateJoinerById(this.followedJoinerId, {partStatus: 3});
	}

	stopObserving() {
		if (this.followedJoinerId == null) {
			console.log('!!!we already stop watching doc');
		} else {
			console.log('stopped watching joiner ' + this.followedJoinerId + ']');
			this.followedJoinerId = null;
			this.followedJoinerSub.unsubscribe();
			this.followedJoinerObs = null;
		}
	}

	// DELEGATE

	readJoinerById(partId: string): Promise<IJoiner> {
		return this.joinerDao.readJoinerById(partId);
	}

	set(id: string, joiner: IJoiner): Promise<void> {
		return this.joinerDao.set(id, joiner);
	}

}
