import { Component, OnInit } from '@angular/core';
import {GameInfoService} from '../../../services/game-info-service';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import { IJoiner } from '../../../domain/ijoiner';
import {ICurrentPart} from '../../../domain/icurrentpart';
import {Router} from '@angular/router';
import {UserNameService} from '../../../services/user-name-service';

@Component({
  selector: 'app-joining-page',
  templateUrl: './joining-page.component.html',
  styleUrls: ['./joining-page.component.css']
})
export class JoiningPageComponent implements OnInit {

  observedJoinerList: Observable<IJoiner>;
  partId: string;
  typeGame: string;
  creator: boolean;
  userName: string;

  private observedGameDoc: AngularFirestoreDocument<ICurrentPart>;

  constructor(private afs: AngularFirestore,
              private _route: Router,
              private gameInfoService: GameInfoService,
              private userNameService: UserNameService) { }

  ngOnInit() {
    console.log('ngOnInit joining page');
    this.gameInfoService.currentMessage.subscribe(receivedIdAndType => {
      const separator = receivedIdAndType.indexOf(':');
      this.partId = receivedIdAndType.substring(0, separator);
      const len = receivedIdAndType.length;
      this.typeGame = receivedIdAndType.substring(separator + 1, len);
      // retrieve db info and make them visible to the html
    });
    this.userNameService.currentMessage.subscribe( userName => {
      this.userName = userName;
    });
    this.setData();
    this.setBeginningRedirection();
  }

  setData() {
    console.log('setData of ' + this.partId + ' and ' + this.typeGame);
    const observedJoinerDoc: AngularFirestoreDocument<IJoiner> = this.afs.doc('joiners/' + this.partId);
    this.observedJoinerList = observedJoinerDoc.valueChanges();
  }

  setBeginningRedirection() {
    console.log('setBeginningRedirection');
    // called after the game creation
    this.observedGameDoc = this.afs.doc('parties/' + this.partId);
    this.observedGameDoc.valueChanges().subscribe( actualPart => {
      this.creator = (actualPart.playerZero === this.userName);
      if (actualPart.playerOne !== '') {
        // when playerOne is set, it is because player zero (the game creator) choose him
        // all joiner-wannabe, the creator, and the chosen one, are then redirected to the game component
        this._route.navigate([actualPart.typeGame + 'Online']);
      }
    });
  }

  startGameWithPlayer(joiner: string) {
    this.observedGameDoc.update({'playerOne' : joiner,
                                      'turn' : 0});
  }

}
