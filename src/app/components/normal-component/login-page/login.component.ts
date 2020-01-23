import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../../../services/UserService';
import {User} from '../../../domain/iuser';
import {CountDownComponent} from '../count-down/count-down.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {

	user = new User('', '', '', null, null, null, null);
	errorMessage: string;

	/* @ViewChild('chrono') chrono: CountDownComponent;
	reachedOutOfTime() { alert('time over dude'); }
	pause() {
		this.chrono.pause();
	}
	resume() {
		this.chrono.resume();
	}
	ngAfterViewInit() {
		this.chrono.start(15 * 1000);
	} */

	constructor(private _route: Router,
				private userService: UserService) {}

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
