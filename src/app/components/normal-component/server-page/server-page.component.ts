import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../domain/iuser';
import { ICurrentPart, ICurrentPartId } from '../../../domain/icurrentpart';

import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

import { IdPartService } from '../../../services/id-part.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-page',
  templateUrl: './server-page.component.html',
  styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

  observedPartieIds: Observable<ICurrentPartId[]>;
  readonly userList: Array<IUser>;
  readonly gameList: Array<String> = ['P4', 'Awale', 'Quarto'];

  choosedId: string;

  constructor(private afs: AngularFirestore,
              private _route: Router,
              private partieIdService: IdPartService
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

  }

  ngOnInit() {
    this.observedPartieIds = this.afs.collection('parties')
      .snapshotChanges().pipe(map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as ICurrentPart;
          const id = a.payload.doc.id;
          return { 'id': id, 'partie' : data };
        });
    }));
  }
  selectGame(id: string) {
    console.log('server page choose this part id : "' + id + '"');
    this.partieIdService.changeMessage(id);
    this._route.navigate(['P4Online']);
  }

}
