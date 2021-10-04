import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';

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
        username: new FormControl(),
        password: new FormControl(),
    });
    public async tryRegister(value: {email: string, pseudo: string, password: string}): Promise<void> {
        try {
            await this.authService.doRegister(value.pseudo, value.email, value.password);
            await this.authService.sendEmailVerification();
            this.router.navigate(['/']);
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
