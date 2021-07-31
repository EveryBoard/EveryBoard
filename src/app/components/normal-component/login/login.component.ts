import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    public errorMessage: string;

    public loginForm: FormGroup = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public loginWithEmail(value: {email: string, password: string}): void {
        this.authenticationService
            .doEmailLogin(value.email, value.password)
            .then(() => this.redirect())
            .catch((err: { message: string }) => {
                const message: string = err.message;
                switch (message) {
                    case 'The password is invalid or the user does not have a password.':
                        this.errorMessage = $localize`This password is incorrect.`;
                        break;
                    case 'There is no user record corresponding to this identifier. The user may have been deleted.':
                        this.errorMessage = $localize`This email address has no account on this website.`;
                        break;
                    case 'Missing or insufficient permissions.':
                        this.errorMessage = $localize`You must click the confirmation link that you should have received by email.`;
                        break;
                    default:
                        this.errorMessage = message;
                        break;
                }
            });
    }
    public loginWithGoogle(): void {
        this.authenticationService
            .doGoogleLogin()
            .then(() => this.redirect())
            .catch((err: { message: string }) => {
                this.errorMessage = err.message;
            });
    }
    private redirect(): void {
        this.router.navigate(['/server']);
    }
}
