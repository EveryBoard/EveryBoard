import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { display } from 'src/app/utils/collection-lib/utils';

@Component({
    selector: 'app-confirm-inscription',
    templateUrl: './confirm-inscription.component.html',
})
export class ConfirmInscriptionComponent implements OnInit {

    public static VERBOSE: boolean = false;

    constructor(private authService: AuthenticationService) {}

    public ngOnInit(): Promise<void> {
        display(ConfirmInscriptionComponent.VERBOSE, 'ConfirmInscriptionComponent.onInit()');

        const user: { pseudo: string; verified: boolean } = this.authService.getAuthenticatedUser();
        if (!user) {
            throw new Error('Unlogged users can\'t access this component');
        }
        if (user.verified === true) {
            throw new Error('Verified users shouldn\'t access this component');
        } else {
            return this.authService.sendEmailVerification();
        }
    }
}
