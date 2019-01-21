import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {PartDAO} from '../dao/PartDAO';

import {ICurrentPart, ICurrentPartId} from '../domain/icurrentpart';
import {IJoiner} from '../domain/ijoiner';

import {JoinerService} from './JoinerService';
import {Router} from '@angular/router';
import {ActivesPartsService} from './ActivesPartsService';
import {ChatService} from './ChatService';
import {IMessage} from '../domain/imessage';
import {IChat} from '../domain/ichat';

@Injectable({
	providedIn: 'root'
})
export class GameService {

	private followedPartId: string;
	private followedPartObs: Observable<ICurrentPartId>;
	private followedPartSub: Subscription;

	constructor(private route: Router,
				private partDao: PartDAO,
				private activesPartsService: ActivesPartsService,
				private joinerService: JoinerService,
				private chatService: ChatService) {}

	// on Server Component

	createGame(creatorName: string, typeGame: string): Promise<string> {
		console.log('GameService.createGame');
		const newPart: ICurrentPart = {
			historic: 'pas implémenté',
			listMoves: [],
			playerZero: creatorName, // TODO: supprimer, il n'y a pas de createur par défaut
			playerOne: '',
			result: 5, // todo : constantiser ça, bordel
			scorePlayerZero: 'pas implémenté',
			scorePlayerOne: 'pas implémenté',
			turn: -1,
			typeGame: typeGame,
			typePart: 'pas implémenté',
			winner: ''
		};
		const newJoiner: IJoiner = {
			candidatesNames: [],
			creator: creatorName,
			chosenPlayer: '',
			// abandonned feature timeoutMinimalDuration: 60,
			firstPlayer: '0', // par défaut: le créateur
			partStatus: 0 // en attente de tout, TODO: constantifier ça aussi !
		};
		const newChat: IChat = {
			status: 'not implemented',
			messages: []
		};
		return new Promise((resolve, reject) => {
			this.partDao
				.createPart(newPart)
				.then(docId => {
					this.joinerService
						.set(docId, newJoiner)
						.then(onFullFilled => {
							this.chatService
								.set(docId, newChat)
								.then(onChatCreated => {
									resolve(docId);
								})
								.catch(onRejected => {
									console.log('chatService.set' + docId + ', ' + JSON.stringify(newJoiner) + ') has failed');
									reject(onRejected);
								});
						})
						.catch(onRejected => {
							console.log('joinerService.set(' + docId + ', ' + JSON.stringify(newJoiner) + ') has failed');
							reject(onRejected);
						});
				}).catch(onRejected => {
				console.log('partDao failed to create part');
				reject(onRejected);
			});
		});
	}

	getActivesPartsObs() {
		// TODO: désabonnements de sûreté aux autres abonnements activesParts
		this.activesPartsService.startObserving();
		return this.activesPartsService.activesPartsObs;
	}

	unSubFromActivesPartsObs() {
		this.activesPartsService.stopObserving();
	}

	// on Part Creation Component

	private startGameWithConfig(joiner: IJoiner): Promise<void> {
		let firstPlayer = joiner.creator;
		let secondPlayer = joiner.chosenPlayer;
		if (joiner.firstPlayer === '2' && (Math.random() < 0.5)) {
			joiner.firstPlayer = '1';
			// random
		}
		if (joiner.firstPlayer === '1') {
			// the opposite config is planned
			secondPlayer = joiner.creator;
			firstPlayer = joiner.chosenPlayer;
		}
		const modification = {
			playerZero: firstPlayer,
			playerOne: secondPlayer,
			turn: 0,
			beginning: Date.now()
		};
		return this.partDao.updatePartById(this.followedPartId, modification);
	}

	deletePart(partId: string): Promise<string> {
		console.log('JoinerService.deletePart ' + partId);
		return new Promise((resolve, reject) => {
			if (partId == null) {
				console.log('followed part id is null');
				reject();
			}
			this.partDao
				.deletePartById(partId)
				.then(onFullFilled => resolve(partId))
				.catch(onRejected => reject());
		});
	}

	acceptConfig(joiner: IJoiner): Promise<void> {
		return new Promise((resolve, reject) => {
			/* if (this.followedPartId == null || this.followedPartId === undefined) {
				console.log('!!! pas de partie en cours d\'observation, comment accepter la config??');
				reject();
			} */ // OLDLY, seem's to allow bug anyway, let's try to suppress it
			this.joinerService
				.acceptConfig()
				.then(onConfigAccepted => {
					this.startGameWithConfig(joiner)
						.then(onSignalSent => resolve(onSignalSent))
						.catch(onRejected => reject(onRejected));
				})
				.catch(onRejected => {
					console.log('GameService.startGameWithConfig failed');
					console.log(onRejected);
					reject(onRejected);
				});
		});
	}

	// on OnlineGame Component

	startObserving(partId: string, callback: (iPart: ICurrentPartId) => void) {
		if (this.followedPartId == null) {
			console.log('[start watching part ' + partId);
			this.followedPartId = partId;
			this.followedPartObs = this.partDao.getPartObsById(partId);
			this.followedPartSub = this.followedPartObs
				.subscribe(onFullFilled => callback(onFullFilled));
		} else if (partId === this.followedPartId) {
			console.log('!!!already observing this part (' + partId + ')');
		} else {
			alert('!!!we were already observing ' + this.followedPartId + ' then you ask to watch ' + partId + ' you are gross (no I\'m bugged)');
			this.stopObserving();
			this.startObserving(partId, callback);
		}
	}

	resign(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			winner: winner,
			result: 1
		}); // resign
	}

	notifyDraw(partId: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			result: 0
		}); // DRAW CONSTANT
	}

	notifyTimeout(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			winner: winner,
			result: 4
		});
	}

	notifyVictory(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			'winner': winner,
			'result': 3
		});
	}

	updateDBBoard(encodedMove: number, partId: string): Promise<void> {
		return this.partDao.readPartById(partId)
			.then(part => {
				const turn: number = part.turn + 1;
				const listMoves: number[] = part.listMoves;
				listMoves[listMoves.length] = encodedMove;
				this.partDao
					.updatePartById(partId, {
						'listMoves': listMoves,
						'turn': turn })
					.catch(onRejected => {
						console.log('part update failed because ' + JSON.stringify(onRejected))
					});
			})
			.catch(error => console.log(error));
	}

	stopObservingPart() {
		if (this.followedPartId == null) {
			console.log('no part to stop observing');
		} else {
			console.log('we stop observing ' + this.followedPartId + ']');
			// this.joinerService.stopObserving();
			this.followedPartId = null;
			this.followedPartObs = null;
		}
	}

	stopObserving() {
		if (this.followedPartId == null) {
			console.log('!!!we already stop watching doc');
		} else {
			console.log('stopped watching joiner ' + this.followedPartId + ']');
			this.followedPartId = null;
			this.followedPartSub.unsubscribe();
			this.followedPartObs = null;
		}
	}

	// old

	startObservingPartOld(docId: string) {
		if (this.followedPartId === docId) {
			console.log('partie ' + docId + 'déjà en cours d\'observation');
		} else if (this.followedPartId == null) {
			console.log('[ we start to observe ' + docId);
			this.followedPartId = docId;
			this.followedPartObs = this.partDao.getPartObsById(docId);
			// this.joinerService.startObserving(docId);
		} else {
			alert('we were already observing ' + this.followedPartId + ' then you ask to watch' + docId + 'you are gross (no I\'m bugged)');
			this.stopObservingPart();
			this.startObservingPartOld(docId);
		}
	}

	proposeConfig(timeout: number, firstPlayer: string): Promise<void> {
		return this.joinerService.proposeConfig(timeout, firstPlayer);
	}

	cancelGame(): Promise<void> {
		console.log('GameService will cancel game ' + this.followedPartId);
		// cancel the currently observed game
		return new Promise((resolve, reject) => {
			this.joinerService
				.deleteJoiner()
				.then(onJoiningCancelled =>
					this.partDao
						.deletePartById(this.followedPartId)
						.then(onPartCancelled => {
							this.stopObservingPart();
							resolve(onPartCancelled);
						})
						.catch(onReject => reject(onReject)))
				.catch(onReject => reject(onReject));
		});
	}

	// DELEGATE

	/* getPartObservableById(partId: string): Observable<ICurrentPart> {
		return this.partDao.getPartObsById(partId);
	} */ // OLD

	setChosenPlayer(pseudo: string): Promise<void> {
		return this.joinerService.setChosenPlayer(pseudo);
	}

}
