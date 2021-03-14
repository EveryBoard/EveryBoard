import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

@Component({
    selector: 'app-inscription',
    templateUrl: './inscription.component.html',
})
export class InscriptionComponent {
    constructor(public authService: AuthenticationService,
                public router: Router) {}

    public errorMessage: string;

    public inscriptionForm: FormGroup = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });
    public tryRegister(value: {email: string, pseudo: string, password: string}): void {
        this.authService
            .doRegister(value)
            .then(
                (res) => this.router.navigate(['/confirm-inscription']),
                (err) => this.errorMessage = err.message);
    }
}
