import { Component, OnInit } from '@angular/core';
import { P4Rules } from '../../../games/games.p4/P4Rules';
import { MoveX } from '../../../jscaip/MoveX';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICurrentPart } from '../../../domain/icurrentpart';

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

  partieId: string; // must be received at page loading

  observedPartie: Observable<ICurrentPart>;
  partieDocument: AngularFirestoreDocument<ICurrentPart>;

  constructor(private afs: AngularFirestore) {}

  ngOnInit() { // totally adaptable to other Rules
    // MNode.ruler = this.rules;

    // shoud be some kind of session-scope
    this.observerRole = 1; // to see if the player is player zero (0) or one (1) or observatory (2+)
    this.players = ['premier', 'deuxième'];
    this.partieId = 'defaultGame';

    this.rules.setInitialBoard();
    this.board = this.rules.node.gamePartSlice.getCopiedBoard();

    this.observedPartie = this.afs.collection('parties').doc(this.partieId).snapshotChanges()
      .pipe(map(actions => {
        return actions.payload.data() as ICurrentPart;
      }));
    this.observedPartie.subscribe((currentPartie) => {
      console.log('Vous êtes dans la subscription');
      if (currentPartie.turn > this.rules.node.gamePartSlice.turn) {
        P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
        const bol: boolean = this.rules.choose(MoveX.get(currentPartie.lastMove));
        console.log('après choosing du mouvement');
        P4Rules.debugPrintBiArray(this.rules.node.gamePartSlice.getCopiedBoard());
        console.log('nouveau mouvement effectué quelque part ' + bol);
        this.updateBoard();
      } else {
        console.log('nouvrau mouvement effectué MAIS mauvais tour');
      }
    });
    this.partieDocument = this.afs.doc('parties/' + this.partieId);
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
          if (this.proposeMoveToJavaService(MoveX.get(x))) {
            console.log('Java a accepté ton mouvement également, ça devrais s\'afficher automatiquement');
          } else {
            console.log('it seem your move is legal to javascript but illegal to java-server');
          }
        }
      } else {
        console.log('Mais c\'est pas ton tour!');
      }
    } else {
      console.log('La partie est finie');
    }
  }
  isPlayerTurn() {
    return true;
  }
  proposeMoveToJavaService(move: MoveX): boolean {
    const docRef = this.partieDocument.ref;
    docRef.get()
    .then((doc) => {
      const oldTurn = doc.get('turn');
      docRef.update({'lastMove' : move.x,
                     'turn' : oldTurn + 1});
    }).catch((error) => {
      console.log(error);
    });
    return true;
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
