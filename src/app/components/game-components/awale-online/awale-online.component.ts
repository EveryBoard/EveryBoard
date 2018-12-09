import {Component, OnInit} from '@angular/core';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {Observable} from 'rxjs';
import {ICurrentPart} from '../../../domain/icurrentpart';
import {AngularFirestore, AngularFirestoreDocument, DocumentReference} from 'angularfire2/firestore';
import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/user-service';
import {map} from 'rxjs/operators';
import {MoveX} from '../../../jscaip/MoveX';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';
import {AwalePartSlice} from '../../../games/games.awale/AwalePartSlice';
import {Router} from '@angular/router';
import {UserDAO} from '../../../dao/UserDAO';
import {IUser, IUserId} from '../../../domain/iuser';
import {HeaderComponent} from '../../normal-component/header/header.component';

@Component({
	selector: 'app-awale-online',
	templateUrl: './awale-online.component.html',
	styleUrls: ['./awale-online.component.css']
})
export class AwaleOnlineComponent implements OnInit {

	rules = new AwaleRules();
	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[] = null;
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;
	currentPlayer: string;
	captured: number[] = [0, 0];
	turn = 0;
	endGame = false;
	winner: string;
	opposant: IUserId;
	allowedTimeoutVictory = false;

	imagesLocation = 'gaviall/pantheonsgame/assets/images/circled_numbers/';

	constructor(private afs: AngularFirestore,
				private gameInfoService: GameInfoService,
				private _route: Router,
				private userService: UserService,
				private userDao: UserDAO) {
	}

	ngOnInit() {
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;

		// should be some kind of session-scope
		this.gameInfoService.currentPartId.subscribe(partId =>
			this.partId = partId);
		this.userService.currentUsername.subscribe(message =>
			this.userName = message);
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.observedPart = this.afs.collection('parties').doc(this.partId).snapshotChanges()
			.pipe(map(actions => {
				return actions.payload.data() as ICurrentPart;
			}));

		this.observedPart.subscribe((updatedICurrentPart) => {
			console.log('Vous êtes dans la subscription');
			console.log('updatedICurrentPart.turn ' + updatedICurrentPart.turn);
			console.log('this.rules.node.gamePartSlice.turn ' + this.rules.node.gamePartSlice.turn);

			// todo : améliorer, ça ne doit pas être set à chaque fois
			if (this.players == null) {
				this.players = [
					updatedICurrentPart.playerZero,
					updatedICurrentPart.playerOne];
				this.observerRole = 2;
				let opposantName = '';
				if (this.players[0] === this.userName) {
					this.observerRole = 0;
					opposantName = this.players[1];
				} else if (this.players[1] === this.userName) {
					this.observerRole = 1;
					opposantName = this.players[0];
				}
				if (opposantName !== '') {
					this.userDao.getUserDocRefByUserName(opposantName)
						.onSnapshot((querySnapshot) => {
							let opposant: IUserId;
							querySnapshot.forEach(doc => {
								const data = doc.data() as IUser;
								const id = doc.id;
								opposant = {id: id, user: data};
							});
							this.opposant = opposant;
							this.startWatchingForOpponentTimeout();
						});
				}
			}

			const listMoves = updatedICurrentPart.listMoves;
			this.turn = updatedICurrentPart.turn;
			if (this.isFinished(updatedICurrentPart.result)) {
				this.endGame = true;
				this.winner = updatedICurrentPart.winner;
			}
			const nbPlayedMoves = listMoves.length;
			let currentPartTurn;
			while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
				P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
				currentPartTurn = this.rules.node.gamePartSlice.turn;
				const bol: boolean = this.rules.choose(MoveX.get(listMoves[currentPartTurn]));
			}
			this.updateBoard();
		});

		this.partDocument = this.afs.doc('parties/' + this.partId);
	}

	startWatchingForOpponentTimeout() {
		if (this.hasTimedOut(this.opposant)) {
			this.allowTimeoutVictory(this.opposant);
		} else {
			this.forbidTimeoutVictory(this.opposant);
		}
		setTimeout( () => this.startWatchingForOpponentTimeout(),
			HeaderComponent.refreshingPresenceTimeout);
	}

	hasTimedOut(opposant: IUserId) {
		const timeOutDuree = 30 * 1000;
		console.log('lastActionTime of your opponant : ' + opposant.user.lastActionTime);
		const mtn: number = Date.now();
		console.log('delta/1000 : ' + ((mtn - opposant.user.lastActionTime) / 1000));
		return (opposant.user.lastActionTime + timeOutDuree < Date.now());
	}

	allowTimeoutVictory(opposant: IUserId) {
		this.allowedTimeoutVictory = true;
	}

	forbidTimeoutVictory(opposant: IUserId) {
		this.allowedTimeoutVictory = false;
	}

	updateBoard() {
		const awalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		this.captured = awalePartSlice.getCapturedCopy();
		this.turn = awalePartSlice.turn;
		this.currentPlayer = this.players[awalePartSlice.turn % 2];
	}

	choose(event: MouseEvent): boolean {
		if (this.isPlayerTurn()) {
			const x: number = Number(event.srcElement.id.substring(2, 3));
			console.log('vous tentez un mouvement en colonne ' + x);

			if (this.rules.node.isEndGame()) {
				console.log('Malheureusement la partie est finie');
				// todo : option de clonage revision commentage
				return false;
			}

			console.log('ça tente bien c\'est votre tour');
			// player's turn
			const choosedMove = MoveX.get(x);
			if (this.rules.choose(choosedMove)) {
				console.log('Et javascript estime que votre mouvement est légal');
				// player make a correct move
				// let's confirm on java-server-side that the move is legal
				this.updateDBBoard(choosedMove);
				if (this.rules.node.isEndGame()) {
					this.notifyVictory();
				}
			} else {
				console.log('Mais c\'est un mouvement illegal');
			}
		} else {
			console.log('Mais c\'est pas ton tour !');
		}
	}

	isFinished(result: number) {
		// fonctionne pour l'instant avec la victoire normale, l'abandon, et le timeout !
		return ((result === 3) || (result === 1) || (result === 4));
	}

	backToServer() {
		this._route.navigate(['server']);
	}

	resign() {
		const victoriousPlayer = this.players[(this.observerRole + 1) % 2];
		const docRef: DocumentReference = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 1
		}); // resign
	}

	notifyVictory() {
		const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		this.endGame = true;
		this.winner = victoriousPlayer;
		const docRef = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 3
		});
	}

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
	}

	notifyTimeout() {
		const victoriousPlayer = this.userName;
		this.endGame = true;
		this.winner = victoriousPlayer;
		const docRef = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 4
		});
	}

	updateDBBoard(move: MoveX) {
		const docRef = this.partDocument.ref;
		docRef.get()
			.then((doc) => {
				const turn: number = doc.get('turn') + 1;
				const listMoves: number[] = doc.get('listMoves');
				listMoves[listMoves.length] = move.x;
				docRef.update({
					'listMoves': listMoves,
					'turn': turn
				});
			}).catch((error) => {
			console.log(error);
		});
	}

	debugPrintArray(b: Array<Array<number>>) {
		for (const line of b) {
			console.log(line);
		}
	}

	debugModifyArray(b: Array<number>) {
		b[3] = 5;
	}

	debugReassignArray(b: Array<number>) {
		b = [-1, -1, -1, -1, -73];
	}


}
