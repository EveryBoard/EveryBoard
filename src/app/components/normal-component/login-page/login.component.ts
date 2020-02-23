import { Component } from '@angular/core';
import {Router} from '@angular/router';

import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    public errorMessage: string;

    public loginForm = new FormGroup({
        email: new FormControl(),
        password: new FormControl()
    });

    constructor(private router: Router,
                private authenticationService: AuthenticationService) {}

    /*
    DEACTIVATED_connectAsGuest() {
        const guestName: string = this.getUnusedGuestName();
        // this.userService.changeUser(guestName, '');
        // for now guest don't have document in the db notifying their presence or absence
        this.router.navigate(['/server']);
    }
*/
    public loginWithEmail(value: {email: string, password: string}) {
        this.authenticationService.doEmailLogin(value.email, value.password)
                        .then(this.redirect)
                    .catch(err => this.errorMessage = err.message);
    }
    public loginWithGoogle() {
        this.authenticationService.doGoogleLogin()
                        .then(this.redirect)
                        .catch(err => this.errorMessage = err.message);
    }
    private redirect = () => {
        this.router.navigate(["/server"]);
    }
    /* 
    DEACTIVATED_logAsHalfMember() {
        if (this.formValid()) {
            /* si on trouve l'utilisateur
             *      -> si le code match
             *              -> on connecte
             *              -> on lui dit que c'est prit ou mauvais code
             *      -> sinon on crée l'user et le connecte
             */
/*            this.userService.logAsHalfMember(this.user.pseudo, this.user.code);
        } else {
            this.errorMessage = 'nom d\'utilisateur ou mot de passe trop court';
        }
    }

    formValid(): boolean {
        return this.user.pseudo.length >= 4 && this.user.code.length >= 4;
    }
/*
    DEACTIVATED_getUnusedGuestName(): string {
        // todo: randomiser de 0000 à 9999 et rajouter les "0" de gauche
        // todo: vérifier l'absence de collisions
        // todo: interdire ce nom aux user normaux

        let index: number = 1000 + (Math.random() * 9000); // [1000:9999]
        index = index - (index % 1);
        const guestName: string = 'guest' + (index.toString());
        return guestName;
    }
*/
}