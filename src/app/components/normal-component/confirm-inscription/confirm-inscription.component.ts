import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { AuthenticationService } from 'src/app/services/authentication-service/AuthenticationService';

@Component({
    selector: 'app-confirm-inscription',
    templateUrl: './confirm-inscription.component.html'
})
export class ConfirmInscriptionComponent implements OnInit {

    constructor(private authService: AuthenticationService) {}

    public ngOnInit() {
        const user: { pseudo: string; verified: boolean } = this.authService.getAuthenticatedUser();
        if (!user) {
            throw new Error("Unlogged users can't access this component");
        }
        if (user.verified === true) {
            throw new Error("Verified users shouldn't access this component");
        } else {
            return this.authService.sendEmailVerification();
        }
    }
}