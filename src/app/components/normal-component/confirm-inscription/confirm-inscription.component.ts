import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/AuthenticationService';

@Component({
    selector: 'app-confirm-inscription',
    templateUrl: './confirm-inscription.component.html',
})
export class ConfirmInscriptionComponent {

    public static VERBOSE: boolean = false;

    constructor(public authService: AuthenticationService) {}

}
