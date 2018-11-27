import { Component, OnInit } from '@angular/core';
import { P4Rules } from '../../../games/games.p4/P4Rules';
import { MoveX } from '../../../jscaip/MoveX';

import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ICurrentPart } from '../../../domain/icurrentpart';

import { GameInfoService } from '../../../services/game-info-service';
import {UserNameService} from '../../../services/user-name-service';

@Component({
  selector: 'app-p4-online',
  templateUrl: './p4-online.component.html',
  styleUrls: ['./p4-online.component.css']
})
export class P4OnlineComponent implements OnInit {

  rules = new P4Rules();
  observerRole: number; // to see if the player is player zero (0) or one (1) or observatory (2+)
  players: string[];
  board: Array<Array<number>>;

  imageLocation = '../../../../../src/assets/images/';
  imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];

  observedPartie: Observable<ICurrentPart>;
  partieDocument: AngularFirestoreDocument<ICurrentPart>;

  partId: string;
  userName: string;

  constructor(private afs: AngularFirestore,
              private gameInfoService: GameInfoService,
              private userNameService: UserNameService) {
  }

  ngOnInit() {
    // totally adaptable to other Rules
    // MNode.ruler = this.rules;

    // shoud be some kind of session-scope
    this.observerRole = 1; // to see if the player is player zero (0) or one (1) or observatory (2+)
    this.players = ['premier', 'deuxième']; // todo : get real users
    this.gameInfoService.currentMessage.subscribe(message => {
      const separator = message.indexOf(':');
      this.partId = message.substring(0, separator);
    });
    this.userNameService.currentMessage.subscribe( message => {
      this.userName = message;
    })

    console.log('this.partId : "' + this.partId + '"');

    this.rules.setInitialBoard();
    this.board = this.rules.node.gamePartSlice.getCopiedBoard();

    this.observedPartie = this.afs.collection('parties').doc(this.partId).snapshotChanges()
      .pipe(map(actions => {
        return actions.payload.data() as ICurrentPart;
      }));

    this.observedPartie.subscribe((updatedICurrentPart) => {
      console.log('Vous êtes dans la subscription');
      console.log('updatedICurrentPart.turn ' + updatedICurrentPart.turn);
      console.log('this.rules.node.gamePartSlice.turn ' + this.rules.node.gamePartSlice.turn);
      this.players = [ updatedICurrentPart.playerZero,
                       updatedICurrentPart.playerOne];
      this.observerRole = 2;
      if (this.players[0] === this.userName) {
        this.observerRole = 0;
      } else {
        if (this.players[1] === this.userName) {
          this.observerRole = 1;
        }
      }
      const listMoves = updatedICurrentPart.listMoves;
      const nbPlayedMoves = listMoves.length;
      let currentPartTurn;
      while (this.rules.node.gamePartSlice.turn < nbPlayedMoves) {
        P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
        currentPartTurn = this.rules.node.gamePartSlice.turn;
        const bol: boolean = this.rules.choose(MoveX.get(listMoves[currentPartTurn]));
        console.log('après choosing du mouvement');
        P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
        console.log('nouveau mouvement effectué quelque part ' + bol);
      }
      this.updateBoard();
    });

    this.partieDocument = this.afs.doc('parties/' + this.partId);
  }

  updateBoard() {
    this.board = this.rules.node.gamePartSlice.getCopiedBoard();
    P4Rules.debugPrintBiArray(this.board);
    const boardValue: number = P4Rules._getBoardValue(this.rules.node);
    console.log('updateBoard : boardValue = ' + boardValue);
  }

  choose(event: MouseEvent): void {
    if (!this.rules.node.isEndGame()) {
      const x: number = Number(event.srcElement.id.substring(1, 2));
      console.log('vous tentez un mouvement en colonne ' + x);
      const turn = this.rules.node.gamePartSlice.turn % 2;
      if (this.isPlayerTurn()) {
        console.log('ça tente bien c\'est votre tour');
        // player's turn
        if (!this.rules.choose(MoveX.get(x))) {
          console.log('Mais c\'est un mouvement illegal');
        } else {
          console.log('Et javascript estime que votre mouvement est légal');
          // player make a correct move
          // let's confirm on java-server-side that the move is legal
          this.updateDBBoard(MoveX.get(x));
        }
      } else {
        console.log('Mais c\'est pas ton tour (' + this.players[(this.rules.node.gamePartSlice.turn % 2)] + ' vs ' + this.userName + ') !');
      }
    } else {
      console.log('La partie est finie');
    }
  }

  isPlayerTurn() {
    const indexPlayer = this.rules.node.gamePartSlice.turn % 2;
    return this.players[indexPlayer] === this.userName;
  }

  updateDBBoard(move: MoveX) {
    const docRef = this.partieDocument.ref;
    docRef.get()
    .then((doc) => {
      const turn: number = doc.get('turn') + 1;
      const listMoves: number[] = doc.get('listMoves');
      listMoves[listMoves.length] = move.x;
      docRef.update({'listMoves' : listMoves,
                          'turn'      : turn});
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
