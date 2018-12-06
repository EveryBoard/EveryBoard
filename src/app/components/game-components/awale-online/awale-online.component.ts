import {Component, OnInit} from '@angular/core';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {Observable} from 'rxjs';
import {ICurrentPart} from '../../../domain/icurrentpart';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {GameInfoService} from '../../../services/game-info-service';
import {UserService} from '../../../services/user-service';
import {map} from 'rxjs/operators';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';
import {AwalePartSlice} from '../../../games/games.awale/AwalePartSlice';
import {MoveCoord} from '../../../jscaip/MoveCoord';
import {Coord} from '../../../jscaip/Coord';

@Component({
	selector: 'app-awale-online',
	templateUrl: './awale-online.component.html',
	styleUrls: ['./awale-online.component.css']
})
export class AwaleOnlineComponent implements OnInit {

	rules = new AwaleRules();
	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[];
	listMoves: number[];
	turn: number;
	localTurn: number;
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;
<<<<<<< HEAD
	gameStatus: string;
	captured: number[];
=======
	currentPlayer: string;
	captured: number[] = [0, 0];
	turn = 0;
	endGame = false;
	winner: string;

>>>>>>> small-security-amelioration
	imagesLocation = 'gaviall/pantheonsgame/assets/images/circled_numbers/';

	constructor(private afs: AngularFirestore,
				private gameInfoService: GameInfoService,
				private userService: UserService) {
	}

	ngOnInit() {
		console.log('awale online on init');
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;

		// should be some kind of session-scope
		this.gameInfoService.currentPartId.subscribe(partId =>
			this.partId = partId);
<<<<<<< HEAD

		this.userService.currentUsername.subscribe(message =>
			this.userName = message);

=======
		this.userService.currentUsername.subscribe(message =>
			this.userName = message);
>>>>>>> small-security-amelioration
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();

		this.observedPart = this.afs.doc('parties/' + this.partId).snapshotChanges()
			.pipe(map(actions => {
				console.log('inside snapshotchange of observedPart');
				return actions.payload.data() as ICurrentPart;
			}));

		this.observedPart.subscribe(updatedICurrentPart => {
			console.log('vous êtes dans la subscription retournant : ' + JSON.stringify(updatedICurrentPart));
			// todo : améliorer, ça ne doit pas être set à chaque fois
			this.players = [
				updatedICurrentPart.playerZero,
				updatedICurrentPart.playerOne];
			this.observerRole = 2;
			if (this.players[0] === this.userName) {
				this.observerRole = 0;
			} else if (this.players[1] === this.userName) {
				this.observerRole = 1;
			}

<<<<<<< HEAD
			this.listMoves = updatedICurrentPart.listMoves;
			this.turn = updatedICurrentPart.turn;
			const nbPlayedMoves: number = this.listMoves.length;
			let localPartTurn: number = this.rules.node.gamePartSlice.turn;
			this.localTurn = this.rules.node.gamePartSlice.turn; // DEBUG
			while (localPartTurn < nbPlayedMoves) {
=======
			const listMoves = updatedICurrentPart.listMoves;
			this.turn = updatedICurrentPart.turn;
			if (updatedICurrentPart.result === 3) {
				this.endGame = true;
				this.winner = updatedICurrentPart.winner;
			}
			const nbPlayedMoves = listMoves.length;
			let currentPartTurn;
			while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
>>>>>>> small-security-amelioration
				P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
				localPartTurn = this.rules.node.gamePartSlice.turn;
				this.localTurn = this.rules.node.gamePartSlice.turn; // DEBUG
				// const newMove: MoveCoord = MoveCoord.get(this.listMoves[localPartTurn]);
				const newMove: MoveCoord = new MoveCoord(this.listMoves[localPartTurn], this.localTurn % 2);
				const validMove: boolean = this.rules.choose(newMove);
				if (!validMove) {
					console.log('MAAAMAAAMIIIHAAA, coup invalide venant de la db ! ');
					console.log(localPartTurn + ' en local vs en remote ' + nbPlayedMoves);
				} else {
					console.log('legal move venant de la db : ' + this.listMoves[localPartTurn]);
				}
			}
			this.updateBoard();
		});

		this.partDocument = this.afs.doc('parties/' + this.partId);
	}

	updateBoard() {
		const awalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		this.captured = awalePartSlice.getCapturedCopy();
<<<<<<< HEAD
		this.gameStatus = this.rules.node.isEndGame() ?
			this.players[(this.turn + 1) % 2] + ' a gagné!' :
			'c\'est au tour de ' + this.players[this.turn % 2];
=======
		this.turn = awalePartSlice.turn;
		this.currentPlayer = this.players[awalePartSlice.turn % 2];
>>>>>>> small-security-amelioration
	}

	choose(event: MouseEvent): boolean {
		this.userService.updateUserActivity();
		if (this.isPlayerTurn()) {
			const x: number = Number(event.srcElement.id.substring(2, 3));
			const y: number = Number(event.srcElement.id.substring(1, 2));
			console.log('vous tentez un mouvement en colonne ' + x);

			if (this.rules.node.isEndGame()) {
				console.log('Malheureusement la partie est finie');
				// todo : option de clonage revision commentage
				return false;
			}

			console.log('ça tombe bien c\'est votre tour');
			// player's turn
			const choosedMove = new MoveCoord(x, y);
			if (this.rules.choose(choosedMove)) {
				console.log('Et javascript estime que votre mouvement est légal');
				// player make a correct move
				// let's confirm on java-server-side that the move is legal
				this.updateDBBoard(choosedMove);
				if (this.rules.node.isEndGame()) {
<<<<<<< HEAD
					const victoriousPlayer = this.players[(this.turn + 1) % 2];
					this.setVictory(victoriousPlayer);
=======
					this.notifyVictory();
>>>>>>> small-security-amelioration
				}
			} else {
				console.log('Mais c\'est un mouvement illegal');
			}
		} else {
			console.log('Mais c\'est pas ton tour !');
		}
	}

	notifyVictory() {
		const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
		this.endGame = true;
		this.winner = victoriousPlayer;
		const docRef = this.partDocument.ref;
		docRef.update({
			winner: victoriousPlayer,
			result: 3,
			scorePlayerZero: this.captured[0],
			scorePlayerOne: this.captured[1]
		});
	}

	isPlayerTurn() {
		return this.players[this.turn % 2] === this.userName;
	}

	updateDBBoard(move: MoveCoord) {
		const docRef = this.partDocument.ref;
		docRef.get()
			.then((doc) => {
				const turn: number = doc.get('turn') + 1;
				const listMoves: Coord[] = doc.get('listMoves');
				listMoves[listMoves.length] = move.coord;
				docRef.update({
					'listMoves': listMoves,
					'turn': turn,
					scorePlayerZero: this.captured[0],
					scorePlayerOne: this.captured[1]
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
