import {Injectable} from '@angular/core';
import {AngularFirestoreDocument, DocumentReference} from 'angularfire2/firestore';
import {BehaviorSubject, Observable} from 'rxjs';

import {PartDAO} from '../dao/PartDAO';

import {ICurrentPart, ICurrentPartId} from '../domain/icurrentpart';
import {IJoiner, IJoinerId} from '../domain/ijoiner';

import {JoinerService} from './JoinerService';
import {GameInfoService} from './game-info-service';
import {JoinerDAO} from '../dao/JoinerDAO';
import {Router} from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class GameService {

	private currentActivePart = new BehaviorSubject<ICurrentPartId[]>([]);
	currentActivePartObservable = this.currentActivePart.asObservable();

	private followedPartId: string;
	private followedPartDoc: AngularFirestoreDocument<ICurrentPart> = null; // TODO : est-ce bien correct point de vue couches DAO/SERVICE?
	private followedPartObservable: Observable<ICurrentPart>;

	constructor(private route: Router,
				private partDao: PartDAO,
				private joinerDao: JoinerDAO,
				private joinerService: JoinerService,
				private gameInfoService: GameInfoService) {
	}

	createAndJoinGame(creatorName: string, typeGame: string) {
		console.log('GameService.createAndJoinGame');
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
			timeoutMinimalDuration: 60,
			firstPlayer: '0', // par défaut: le créateur
			partStatus: 0 // en attente de tout, TODO: constantifier ça aussi !
		};
		this.partDao
			.addPartNew(newPart)
			.then(docId => {
				console.log('partDao.addPart fullfilled for ' + docId);
				this.joinerService
					.set(docId, newJoiner)
					.then(onfullfilled => {
						console.log('joinerService.set fullfilled for ' + docId);
						this.gameInfoService.changeGame(docId, typeGame); // TODO : usefull ?
						this.startObservingPart(docId);
						this.route.navigate(['/' + typeGame, docId]);
					})
					.catch(onrejected =>
						console.log('joinerService.set(' + docId + ', ' + JSON.stringify(newJoiner) + ') has failed'));
			});
	}

	joinGame(partId: string, userName: string): Promise<void> {
		console.log('oldPartService.joinGame');
		const partRef: DocumentReference = this.partDao.getPartDocRefById(partId);
		const joinerRef: DocumentReference = this.joinerDao.getJoinerDocRefById(partId);
		return partRef.get()
			.then(partDoc => {
				const creator = partDoc.get('playerZero');
				joinerRef
					.get()
					.then(joinerDoc => {
						const joinerList: string[] = joinerDoc.get('candidatesNames');
						if (!joinerList.includes(userName) &&
							(userName !== creator)) {
							joinerList[joinerList.length] = userName;
							joinerRef
								.update({candidatesNames: joinerList})
								.catch(onrejected => console.log('partService.joiningGame joiner Update rejected'));
						}
					})
					.catch(onrejected => console.log('partService.joiningGame get joiner rejected'));
			});
	}

	setChosenPlayer(pseudo: string): Promise<void> {
		return this.joinerService.setChosenPlayer(pseudo);
	}

	proposeConfig(timeout: number, firstPlayer: string): Promise<void> {
		return this.joinerService.proposeConfig(timeout, firstPlayer);
	}

	cancelGame(): Promise<void> {
		console.log('part service will cancel game ' + this.followedPartId);
		// cancel the currently observed game
		return this.joinerService.cancelGame().then(
			onJoiningCancelled => this.followedPartDoc.delete().then(
				onPartCancelled => this.stopObservingPart()));
	}

	acceptConfig(joiner: IJoiner): Promise<void> {
		this.startGameWithConfig(joiner);
		return this.joinerService.acceptConfig();
	}

	startObservingPart(docId: string) {
		if (this.followedPartId === docId) {
			console.log('partie ' + docId + 'déjà en cours d\'observation');
		} else if (this.followedPartId == null) {
			console.log('[ we start to observe ' + docId);
			this.followedPartId = docId;
			this.followedPartDoc = this.partDao.getPartAFDocById(docId);
			this.followedPartObservable = this.partDao.getPartObservableById(docId);
			this.joinerService.startObservingJoiner(docId);
		} else {
			alert('we were already observing ' + this.followedPartId + ' then you ask to watch' + docId + 'you are gross (no I\'m bugged)');
			this.stopObservingPart();
			this.startObservingPart(docId);
		}
	}

	observeAllActivePart() {
		const allActivesPartSub: () => void = this.partDao // TODO: utiliser
			.observeAllActivePart(querySnapshot => {
				const tmpPartIds: ICurrentPartId[] = [];
				querySnapshot.forEach(doc => {
					const data = doc.data() as ICurrentPart;
					const id = doc.id;
					tmpPartIds.push({id: id, part: data});
				});
				this.currentActivePart.next(tmpPartIds);
			});
	}

	getPartId(): string {
		return this.followedPartId;
	}

	getPartObservable(): Observable<ICurrentPart> {
		return this.followedPartObservable;
	}

	getJoinerIdObservable(): Observable<IJoinerId> {
		return this.joinerService.getJoinerIdObservable();
	}

	removePlayerFromJoiningPage(userName: string) {
		this.joinerService.removePlayerFromJoiningPage(userName);
	}

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
		return this.followedPartDoc.update({
			playerZero: firstPlayer,
			playerOne: secondPlayer,
			turn: 0,
			beginning: Date.now()
		});
	}

	stopObservingPart() {
		if (this.followedPartId == null) {
			console.log('no part to stop observing');
		} else {
			console.log('we stop observing ' + this.followedPartId + ']');
			this.joinerService.stopObservingJoiner();
			this.followedPartId = null;
			this.followedPartDoc = null;
			this.followedPartObservable = null;
		}
	}

}
