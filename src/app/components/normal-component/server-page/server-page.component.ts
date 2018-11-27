import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../domain/iuser';
import { ICurrentPart, ICurrentPartId } from '../../../domain/icurrentpart';

import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

import { Router } from '@angular/router';
import { GameInfoService } from '../../../services/game-info-service';
import { UserNameService } from '../../../services/user-name-service';

@Component({
  selector: 'app-server-page',
  templateUrl: './server-page.component.html',
  styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

  observedPartieIds: Observable<ICurrentPartId[]>;
  readonly userList: Array<IUser>;
  readonly gameNameList: String[] = ['P4', 'Awale', 'Quarto'];
  selectedGame: string;
  userName: string;

  constructor(private afs: AngularFirestore,
              private _route: Router,
              private gameInfoService: GameInfoService,
              private userNameService: UserNameService
  ) {
    /*
    const p1: ICurrentPart = {
      'typeGame' : 'P4',
      'playerZero' : 'thePlayerZero',
      'playerOne' : 'thePlayerOne',
      'turn' : 0
    };
    const p2: ICurrentPart = {
      'typeGame' : 'Awale',
      'playerZero' : 'the2',
      'playerOne' : 'the3',
      'turn' : 15
    };
    this.partList = [p1, p2];
    */
    const u1: IUser = {
      'id': 0,
      'pseudo' : 'roger',
      'email' : 'who care',
      'dateInscription' : new Date(),
      'status' : 0,
    };
    const u2: IUser = {
      'id': 1,
      'pseudo' : 'beniuiui',
      'email' : 'lol@mdr.com',
      'dateInscription' : new Date(),
      'status' : 0,
    };
    this.userList = [u1, u2];
    console.log('server page component constructor');
  }

  ngOnInit() {
    this.userNameService.currentMessage.subscribe( message =>
      this.userName = message);
    this.observedPartieIds = this.afs.collection('parties')
      .snapshotChanges().pipe(map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as ICurrentPart;
          const id = a.payload.doc.id;
          return { 'id': id, 'part' : data };
        });
      }));
    console.log('server page component ON INIT');
  }

  joinGame(info: string) {
    console.log('server page choose this part info : [' + info + ']');
    const separator = info.indexOf(':');
    const id = info.substring(0, separator);
    const docRef = this.afs.doc('joiners/' + id).ref;
    docRef.get()
      .then(doc => {
        const joinerList: string[] = doc.get('names');
        joinerList[joinerList.length] = this.userName;
        docRef.update({'names' : joinerList});
      });
    this.gameInfoService.changeMessage(info);
    this._route.navigate(['joiningPage']);
  }

  createGame() {
    console.log('want to create a ' + this.selectedGame);
    if (this.canCreateGame()) {
      this.afs.collection('parties')
        .add({
          'beginning'       : 'pas implémenté',
          'historic'        : 'pas implémenté',
          'listMoves'       : [],
          'playerZero'      : this.userName,
          'playerOne'       : '',
          'result'          : 'pas implémenté',
          'scorePlayerZero' : 'pas implémenté',
          'scorePlayerOne'  : 'pas implémenté',
          'turn'            : -1,
          'typeGame'        : this.selectedGame,
          'typePart'        : 'pas implémenté',
          'winner'          : 'pas implémenté'})
        .then((docRef) => {
          this.afs.collection('joiners')
            .doc(docRef.id)
            .set({'names' : []});
          this.gameInfoService.changeMessage(docRef.id + ':' + this.selectedGame);
          this._route.navigate(['joiningPage']);
        });
    }
  }

  canCreateGame(): boolean {
    // todo: vérifier que l'utilisateur n'as pas une partie en cours
    return true ;
  }
}
