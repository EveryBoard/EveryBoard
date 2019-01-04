import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {BehaviorSubject, Observable} from 'rxjs';

import {PartDAO} from '../dao/PartDAO';

import {ICurrentPart, ICurrentPartId} from '../domain/icurrentpart';
import {IJoiner, IJoinerId} from '../domain/ijoiner';

import {JoinerService} from './JoinerService';
import {GameInfoService} from './game-info-service';

@Injectable({
	providedIn: 'root'
})
export class NewPartService {

	private currentActivePart = new BehaviorSubject<ICurrentPartId[]>([]);
	currentActivePartObservable = this.currentActivePart.asObservable();

	private followedPartId: string;
	private followedPartDoc: AngularFirestoreDocument<ICurrentPart> = null; // TODO : est-ce bien correct point de vue couches DAO/SERVICE?
	private followedPartObservable: Observable<ICurrentPart>;

	constructor(private afs: AngularFirestore,
				private partDao: PartDAO,
				private joinerService: JoinerService) {
	}

	createGame(creatorName: string, typeGame: string): Promise<void> {
		console.log('oldPartService.createAndJoinGame');
		const newPart: ICurrentPart = {
			historic: 'pas implémenté',
			listMoves: [],
			playerZero: creatorName, // TODO: supprimer, il n'y a pas de premier joueur par défaut
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
		return this.afs.collection('parties')
			.add(newPart)
			.then(docRef => {
				this.followedPartId = docRef.id;
				this.afs.collection('joiners').doc(docRef.id)
					.set(newJoiner);
			});
	}

	private startObservingPart(docId: string) {
		console.log('[ we start to observe ' + docId);
		if (this.followedPartId != null) {
			console.log('euh, on observais déjà une partie en fait, malpropre...');
			this.stopObservingPart();
		}
		this.followedPartId = docId;
		this.followedPartDoc = this.partDao.getPartAFDocById(docId);
		this.followedPartObservable = this.partDao.getPartObservableById(docId);
		this.joinerService.startObservingJoiner(docId);
	}

	joinGame(partId: string, userName: string) {
		console.log('oldPartService.joinGame');
		const partRef = this.afs.doc('parties/' + partId).ref;
		const joinerRef = this.afs.doc('joiners/' + partId).ref;
		partRef.get()
			.then(partDoc => {
				const creator = partDoc.get('playerZero');
				joinerRef.get()
					.then(joinerDoc => {
						const joinerList: string[] = joinerDoc.get('candidatesNames');
						if (!joinerList.includes(userName) &&
							(userName !== creator)) {
							joinerList[joinerList.length] = userName;
							joinerRef.update({candidatesNames: joinerList});
						}
					});
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

	observeAllActivePart() {
		this.afs.collection('parties').ref
			.where('result', '==', 5) // TODO : afs se fait appeler par les DAO !
			.onSnapshot((querySnapshot) => {
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
		console.log('we stop observing ' + this.followedPartId + ']');
		this.followedPartId = null;
		this.followedPartDoc = null;
		this.followedPartObservable = null;
	}

}
