import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {UserNameService} from '../../../services/user-name-service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	userForm = this.formBuilder.group({
		userName: ['', Validators.required],
		password: ['', Validators.required]
	});

	constructor(private _route: Router,
				private userNameService: UserNameService,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
	}

	connectAsGuest() {
		const guestName: string = this.getUnusedGuestName();
		console.log('connection en tant qu\'invité [' + guestName + ']');
		this.userNameService.changeMessage(guestName);
		this._route.navigate(['server']);
	}

	logAsMember() {
		// todo : implémenter la connection en tant qu'utilisateur
		console.log('connection en tant que membre! Bienvenu');
	}

	getUnusedGuestName(): string {
		// todo: randomiser de 000 à 999 et rajouter les "0" de gauche
		// todo: vérifier l'absence de collisions

		let index: number = 100 + (Math.random() * 900); // [100:999]
		index = index - (index % 1);
		const guestName: string = 'guest' + (index.toString());
		return guestName;
	}

}
