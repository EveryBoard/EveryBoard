import { Component } from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
    selector: 'app-confirm-inscription',
    templateUrl: './confirm-inscription.component.html'
})
export class ConfirmInscriptionComponent {

    constructor() {
        this.sendVerification();
    }
    private sendVerification() {
        const user: firebase.User = firebase.auth().currentUser;
        if (!user) {
            window.alert("Mais il est même pas connecté c'con là");
            throw new Error("paydaaaaay");
        }
        if (user.emailVerified === true) {
            console.log("Bah, vous êtes déjà vérifié monsieur");
        } else {
            window.alert();
            return user.sendEmailVerification();
        }
    }
}