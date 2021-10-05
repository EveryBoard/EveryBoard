import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import firebase from 'firebase/app';
import { MGPValidation } from 'src/app/utils/MGPValidation';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
})
export class RegistrationComponent {
    constructor(public authService: AuthenticationService,
                public router: Router) {}

    public errorMessage: string;

    public registrationForm: FormGroup = new FormGroup({
        email: new FormControl(),
        username: new FormControl(),
        password: new FormControl(),
    });
    public async tryRegister(value: {email: string, username: string, password: string}): Promise<boolean> {
        const registrationResult: MGPFallible<firebase.User> =
            await this.authService.doRegister(value.username, value.email, value.password);
        if (registrationResult.isSuccess()) {
            const emailResult: MGPValidation =
                await this.authService.sendEmailVerification();
            if (emailResult.isSuccess()) {
                return this.router.navigate(['/']);
            } else {
                this.errorMessage = emailResult.getReason();
            }
        } else {
            this.errorMessage = registrationResult.getReason();
        }
    }
}
