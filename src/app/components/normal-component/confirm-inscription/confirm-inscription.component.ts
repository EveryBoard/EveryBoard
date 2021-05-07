import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { display } from 'src/app/utils/utils';

@Component({
    selector: 'app-confirm-inscription',
    templateUrl: './confirm-inscription.component.html',
})
export class ConfirmInscriptionComponent implements OnInit {

    public static VERBOSE: boolean = false;

    constructor(public authService: AuthenticationService) {}

    public ngOnInit(): Promise<void> {
        display(ConfirmInscriptionComponent.VERBOSE, 'ConfirmInscriptionComponent.onInit()');

        return this.authService.sendEmailVerification();
    }
}
