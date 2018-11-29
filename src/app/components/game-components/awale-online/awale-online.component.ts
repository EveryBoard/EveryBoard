import {Component, OnInit} from '@angular/core';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {Observable} from 'rxjs';
import {ICurrentPart} from '../../../domain/icurrentpart';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {GameInfoService} from '../../../services/game-info-service';
import {UserNameService} from '../../../services/user-name-service';
import {map} from 'rxjs/operators';
import {MoveX} from '../../../jscaip/MoveX';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';

@Component({
	selector: 'app-awale-online',
	templateUrl: './awale-online.component.html',
	styleUrls: ['./awale-online.component.css']
})
export class AwaleOnlineComponent implements OnInit {

	rules = new AwaleRules();
	observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2)
	players: string[];
	board: Array<Array<number>>;

	observedPart: Observable<ICurrentPart>;
	partDocument: AngularFirestoreDocument<ICurrentPart>;

	partId: string;
	userName: string;

	constructor(private afs: AngularFirestore,
				private gameInfoService: GameInfoService,
				private userNameService: UserNameService) {
	}

	ngOnInit() {
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;

		// should be some kind of session-scope
		this.gameInfoService.currentMessage.subscribe(message => {
			const separator = message.indexOf(':');
			this.partId = message.substring(0, separator);
		});

		// this.userName = this.userNameService.userName;
		this.userNameService.currentMessage.subscribe(message => {
			this.userName = message;
		});

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
			this.players = [updatedICurrentPart.playerZero,
				updatedICurrentPart.playerOne];
			this.observerRole = 2;
			if (this.players[0] === this.userName) {
				this.observerRole = 0;
			} else if (this.players[1] === this.userName) {
				this.observerRole = 1;
			}

			const listMoves = updatedICurrentPart.listMoves;
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

	updateBoard() {
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
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
					const victoriousPlayer = this.players[(this.rules.node.gamePartSlice.turn + 1) % 2];
					this.setVictory(victoriousPlayer);
				}
			} else {
				console.log('Mais c\'est un mouvement illegal');
			}
		} else {
			console.log('Mais c\'est pas ton tour !');
		}
	}

	setVictory(victoriousPlayer: string) {
		const docRef = this.partDocument.ref;
		docRef.update({
			'winner': victoriousPlayer,
			'result': 3
		});
	}

	isPlayerTurn() {
		const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
		return this.players[indexPlayer] === this.userName;
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
