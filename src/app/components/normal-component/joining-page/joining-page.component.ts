import {Component, OnInit} from '@angular/core';
import {GameInfoService} from '../../../services/game-info-service';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {IJoiner} from '../../../domain/ijoiner';
import {ICurrentPart} from '../../../domain/icurrentpart';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';

@Component({
	selector: 'app-joining-page',
	templateUrl: './joining-page.component.html',
	styleUrls: ['./joining-page.component.css']
})
export class JoiningPageComponent implements OnInit {

	observedJoinerList: Observable<IJoiner>;
	partId: string;
	gameName: string;
	creator: boolean;
	userName: string;

	private observedGameDoc: AngularFirestoreDocument<ICurrentPart>;
	private observedJoinerDoc: AngularFirestoreDocument<IJoiner>;

	constructor(private afs: AngularFirestore,
				private _route: Router,
				private gameInfoService: GameInfoService,
				private userService: UserService) {}

	ngOnInit() {
		this.gameInfoService.currentGameName.subscribe(gameName =>
			this.gameName = gameName);
		// retrieve db info and make them visible to the html
		this.gameInfoService.currentPartId.subscribe(partId =>
			this.partId = partId);
		this.userService.currentUsername.subscribe(userName => {
			this.userName = userName;
		});
		this.setData();
		this.setBeginningRedirection();
	}

	setData() {
		console.log(this.partId + 'la partie qu\'on va charger');
		this.observedJoinerDoc = this.afs.doc('joiners/' + this.partId);
		this.observedJoinerList = this.observedJoinerDoc.valueChanges();
		this.observedGameDoc = this.afs.doc('parties/' + this.partId);
	}

	setBeginningRedirection() {
		// called after the game creation
		this.observedGameDoc.valueChanges()
			.subscribe(actualPart => {
				this.creator = (actualPart.playerZero === this.userName);
				if (actualPart.playerOne !== '') {
					// when playerOne is set, it is because player zero (the game creator) choose him
					// all joiner-wannabe, the creator, and the chosen one, are then redirected to the game component
					this._route.navigate([actualPart.typeGame + 'Online']);
				}
		});
	}

	startGameWithPlayer(joiner: string) {
		this.observedGameDoc.update({
			playerOne: joiner,
			turn: 0,
			beginning: Date.now()
		});
	}

	cancelGame() {
		this.observedJoinerDoc.delete();
		this.observedGameDoc.delete();
		this._route.navigate(['server']);
	}

	cancelGameJoining() {
		this.observedJoinerDoc.ref.get()
			.then( joinersDoc => {
				const joiners = joinersDoc.data() as IJoiner;
				const joinersList: string[] = joiners.names;
				const index = joinersList.indexOf(this.userName);
				joinersList.splice(index, 1);
				this.observedJoinerDoc.update({names : joinersList});
			});
		this._route.navigate(['server']);
	}

}
