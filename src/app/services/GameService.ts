import {Injectable} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {PartDAO} from '../dao/PartDAO';

import {ICurrentPart, ICurrentPartId} from '../domain/icurrentpart';
import {IJoiner} from '../domain/ijoiner';

import {JoinerService} from './JoinerService';
import {Router} from '@angular/router';
import {ActivesPartsService} from './ActivesPartsService';
import {ChatService} from './ChatService';
import {IChat} from '../domain/ichat';
import {MGPRequest} from '../domain/request';

@Injectable({
	providedIn: 'root'
})
export class GameService {

	static VERBOSE = false;

	private followedPartId: string;
	private followedPartObs: Observable<ICurrentPartId>;
	private followedPartSub: Subscription;

	constructor(private route: Router,
				private partDao: PartDAO,
				private activesPartsService: ActivesPartsService,
				private joinerService: JoinerService,
				private chatService: ChatService) {
	}

	// on Server Component

	protected createPart(creatorName: string, typeGame: string, chosenPlayer: string): Promise<string> {
		if (GameService.VERBOSE) {
			console.log('GameService.createPart(' + creatorName + ', ' + typeGame + ', ' + chosenPlayer);
		}
		const newPart: ICurrentPart = {
			listMoves: [],
			playerZero: creatorName,
			playerOne: chosenPlayer,
			result: 5, // todo : constantiser ça, bordel
			scorePlayerZero: 'pas implémenté',
			scorePlayerOne: 'pas implémenté',
			turn: -1,
			typeGame: typeGame,
			winner: ''
		};
		return this.partDao.createPart(newPart);
	}

	protected createJoiner(creatorName: string, joinerId: string): Promise<void> {
		if (GameService.VERBOSE) {
			console.log('GameService.createJoiner(' + creatorName + ', ' + joinerId + ')');
		}
		const newJoiner: IJoiner = {
			candidatesNames: [],
			creator: creatorName,
			chosenPlayer: '',
			// abandonned feature timeoutMinimalDuration: 60,
			firstPlayer: '0', // par défaut: le créateur
			partStatus: 0 // en attente de tout, TODO: constantifier ça aussi !
		};
		return this.joinerService.set(joinerId, newJoiner);
	}

	protected createChat(chatId: string): Promise<void> {
		if (GameService.VERBOSE) {
			console.log('GameService.createChat(' + chatId + ')');
		}
		const newChat: IChat = {
			status: 'not implemented',
			messages: []
		};
		return this.chatService.set(chatId, newChat);
	}

	createGame(creatorName: string, typeGame: string, chosenPlayer: string): Promise<string> {
		if (GameService.VERBOSE) {
			console.log('GameService.createGame(' + creatorName + ', ' + typeGame + ')');
		}
		return new Promise((resolve, reject) => {
			this.createPart(creatorName, typeGame, chosenPlayer)
				.then(docId => {
					this.createJoiner(creatorName, docId)
						.then(onFullFilled => {
							this.createChat(docId)
								.then(onChatCreated => {
									resolve(docId);
								})
								.catch(onRejected => {
									console.log('chatService.set' + docId + ' has failed because ');
									console.log(JSON.stringify(onRejected));
									reject(onRejected);
								});
						})
						.catch(onRejected => {
							console.log('joinerService.set(' + docId + ' has failed because ');
							console.log(JSON.stringify(onRejected));
							reject(onRejected);
						});
				})
				.catch(onRejected => {
					console.log('partDao failed to create part because');
					console.log(JSON.stringify(onRejected));
					reject(onRejected);
				});
		});
	}

	getActivesPartsObs() {
		// TODO: désabonnements de sûreté aux autres abonnements activesParts
		if (GameService.VERBOSE) {
			console.log('GameService.getActivesPartsObs()');
		}
		this.activesPartsService.startObserving();
		return this.activesPartsService.activesPartsObs;
	}

	unSubFromActivesPartsObs() {
		if (GameService.VERBOSE) {
			console.log('GameService.unSubFromActivesPartsObs()');
		}
		this.activesPartsService.stopObserving();
	}

	// on Part Creation Component

	private startGameWithConfig(joiner: IJoiner): Promise<void> {
		if (GameService.VERBOSE) {
			console.log('GameService.startGameWithConfig' + JSON.stringify(joiner));
		}
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
		if (GameService.VERBOSE) {
			console.log('GameService.deletePart(' + partId + ')');
		}
		return new Promise((resolve, reject) => {
			if (partId == null) {
				console.log('followed part id is null');
				reject();
			}
			this.partDao
				.deletePartById(partId)
				.then(onFullFilled => resolve(partId))
				.catch(onRejected => reject(onRejected));
		});
	}

	acceptConfig(joiner: IJoiner): Promise<void> {
		if (GameService.VERBOSE) {
			console.log('GameService.acceptConfig(' + JSON.stringify(joiner) + ')');
		}
		return new Promise((resolve, reject) => {
			if (this.followedPartId == null) {
				console.log('!!! pas de partie en cours d\'observation, comment accepter la config ', joiner , '??');
				reject();
			} // OLDLY, seem's to allow bug anyway, let's try to suppress it
			this.joinerService
				.acceptConfig()
				.then(onConfigAccepted => {
					console.log('config accepted !');
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
			if (GameService.VERBOSE) {
				console.log('[start watching part ' + partId);
			}
			this.followedPartId = partId;
			this.followedPartObs = this.partDao.getPartObsById(partId);
			this.followedPartSub = this.followedPartObs
				.subscribe(onFullFilled => callback(onFullFilled));
		} else if (partId === this.followedPartId) {
			if (GameService.VERBOSE) {
				console.log('!!! already observing this part (' + partId + ')');
			}
		} else if (partId == null) {
			if (GameService.VERBOSE) {
				console.log('!!! we are observing ' + this.followedPartId + ' then you ask to watch nothing...');
			}
		} else {
			if (GameService.VERBOSE) {
				console.log('!!! we were already observing ' + this.followedPartId);
				console.log(' then you ask to watch ' + partId + ' you are gross (no I\'m bugged)');
			}
			this.stopObserving();
			this.startObserving(partId, callback);
		}
	}

	resign(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			winner: winner,
			result: 1,
			request: null
		}); // resign
	}

	notifyDraw(partId: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			result: 0,
			request: null
		}); // DRAW CONSTANT
	}

	notifyTimeout(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			winner: winner,
			result: 4,
			request: null
		});
	}

	notifyVictory(partId: string, winner: string): Promise<void> {
		return this.partDao.updatePartById(partId, {
			'winner': winner,
			'result': 3,
			request: null
		});
	}

	proposeRematch(partId: string, oberserverRole: 0 | 1): Promise<void> {
		const req: MGPRequest = {code: 6 + oberserverRole};
		return this.partDao.updatePartById(partId, {request: req});
	}

	acceptRematch(part: ICurrentPartId, callback: (iPart: ICurrentPartId) => void): Promise<void> { // TODO: supprimer l'callback
		return new Promise((resolve, reject) => {
			this.joinerService
				.readJoinerById(part.id)
				.then(iJoiner => {
					this.createGame(iJoiner.creator, part.part.typeGame, iJoiner.chosenPlayer)
						.then(rematchId => {
							let firstPlayer: string = iJoiner.firstPlayer;
							if (firstPlayer === '2') {
								if (part.part.playerZero === iJoiner.creator) {
									// the creator started the previous game thank to hazard
									firstPlayer = '1'; // so he won't start this one
								} else {
									firstPlayer = '0';
								}
							} else {
								firstPlayer = firstPlayer === '0' ? '1' : '0';
							}
							const newJoiner: IJoiner = {
								candidatesNames: iJoiner.candidatesNames,
								creator: iJoiner.creator,
								chosenPlayer: iJoiner.chosenPlayer,
								firstPlayer: firstPlayer,
								partStatus: 3, // already started
								maximalMoveDuration: iJoiner.maximalMoveDuration,
								totalPartDuration: iJoiner.totalPartDuration
							};
							const req: MGPRequest = {
								code: 8,
								partId: rematchId,
								typeGame: part.part.typeGame
							};
							this.joinerService
								.updateJoinerById(rematchId, newJoiner)
								.then(onFullFilled => {
									this.partDao
										.updatePartById(part.id, {request: req})
										.then(onAccepted => resolve())
										.catch(onRejected => {
											console.log('updating part failed, rematch cannot be created because ');
											console.log(JSON.stringify(onRejected));
											reject(onRejected);
										});
								})
								.catch(onRejected => {
									console.log('creation joiner failed, rematch cannot be created because ');
									console.log(JSON.stringify(onRejected));
									reject(onRejected);
								});
						})
						.catch(onRejected => {
							console.log('creation part failed, rematch cannot be created because ');
							console.log(JSON.stringify(onRejected));
							reject(onRejected);
						});
				})
				.catch(onRejected => {
					console.log('reading current joiner failed, rematch cannot be created because ');
					console.log(JSON.stringify(onRejected));
					reject(onRejected);
				});
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
						'turn': turn,
						request: null
					})
					.catch(onRejected => {
						console.log('part update failed because ' + JSON.stringify(onRejected));
					});
			})
			.catch(error => console.log(error));
	}

	stopObservingPart() {
		if (GameService.VERBOSE) {
			console.log('GameService.stopObservingPart();');
		}
		if (this.followedPartId == null) {
			if (GameService.VERBOSE) {
				console.log('no part to stop observing');
			}
		} else {
			if (GameService.VERBOSE) {
				console.log('we stop observing ' + this.followedPartId + ']');
			}
			// this.joinerService.stopObserving();
			this.followedPartId = null;
			this.followedPartObs = null;
		}
	}

	stopObserving() {
		if (GameService.VERBOSE) {
			console.log('GameService.stopObserving();');
		}
		if (this.followedPartId == null) {
			console.log('!!!we already stop watching doc');
		} else {
			if (GameService.VERBOSE) {
				console.log('stopped watching joiner ' + this.followedPartId + ']');
			}
			this.followedPartId = null;
			this.followedPartSub.unsubscribe();
			this.followedPartObs = null;
		}
	}

}
