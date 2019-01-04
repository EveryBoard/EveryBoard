import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../../../services/UserService';
import {AngularFirestore} from 'angularfire2/firestore';
import {IUser, IUserId, User} from '../../../domain/iuser';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	user = new User('', '', '', null, null, null);
	errorMessage: string;

	constructor(private _route: Router,
				private userService: UserService,
				private afs: AngularFirestore) {
	}

	ngOnInit() {}

	connectAsGuest() {
		const guestName: string = this.getUnusedGuestName();
		// this.userService.changeUser(guestName, '');
		// for now guest don't have document in the db notifying their presence or absence
		this._route.navigate(['/server']);
	}

	logAsMember() {
		// todo : implémenter la connection en tant qu'utilisateur
		console.log('connection en tant que membre! Bienvenu');
	}

	logAsHalfMember() {
		if (this.formValid()) {
			/* si on trouve l'utilisateur
			 *	  -> si le code match
			 *	  		-> on connecte
			 *	  		-> on lui dit que c'est prit ou mauvais code
			 *	  -> sinon on crée l'user et le connecte
			 */
			this.userService.logAsHalfMember(this.user.pseudo, this.user.code);
		} else {
			this.errorMessage = 'nom d\'utilisateur ou mot de passe trop court';
		}
	}

	/*
	onFoundUser(user: IUserId) {
		this.unsubscribe();
		if (this.user.code === user.user.code) {
			this.userDocId = user.id;
			this.logValidHalfMember();
		} else {
			this.errorMessage = 'code incorrect !';
		}
	}

	onNewUser() {
		this.unsubscribe();
		if (this.matchingCode === undefined) { // todo : remplacer par ==
			this.createHalfMemberThenLog();
		}
	}

	createHalfMemberThenLog() {
		this.afs.collection('joueurs').add({
			code: this.user.code,
			pseudo: this.user.pseudo,
			email: '',
			inscriptionDate: Date.now(),
			lastActionTime: Date.now(),
			status : -1
		}).then((docRef) => {
			this.userDocId = docRef.id;
			this.logValidHalfMember();
		});
	}

	logValidHalfMember() {
		this.afs.collection('joueurs')
			.doc(this.userDocId).update({
				lastActionTime: Date.now(),
				status: -2 // TODO calculate what that must be
			});
		this.userService.changeUser(this.user.pseudo, this.userDocId);
		this._route.navigate(['/server']);
	} */

	formValid(): boolean {
		return this.user.pseudo.length >= 4 && this.user.code.length >= 4;
	}

	getUnusedGuestName(): string {
		// todo: randomiser de 0000 à 9999 et rajouter les "0" de gauche
		// todo: vérifier l'absence de collisions
		// todo: interdire ce nom aux user normaux

		let index: number = 1000 + (Math.random() * 9000); // [1000:9999]
		index = index - (index % 1);
		const guestName: string = 'guest' + (index.toString());
		return guestName;
	}

}
