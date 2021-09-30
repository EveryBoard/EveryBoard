import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPValidation } from 'src/app/utils/MGPValidation';

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
    public async loginWithEmail(value: {email: string, password: string}): Promise<void> {
        const result: MGPValidation = await this.authenticationService.doEmailLogin(value.email, value.password);
        if (result.isSuccess()) {
            await this.redirect();
        } else {
            switch (result.getReason()) {
                case 'The password is invalid or the user does not have a password.':
                    this.errorMessage = ;
                    break;
                case 'There is no user record corresponding to this identifier. The user may have been deleted.':
                    this.errorMessage = $localize`This email address has no account on this website.`;
                    break;
                case 'Missing or insufficient permissions.':
                    this.errorMessage = $localize`You must click the confirmation link that you should have received by email.`;
                    break;
                default:
                    this.errorMessage = result.getReason();
                    break;
            }
        }
    }
    public loginWithGoogle(): void {
        this.authenticationService
            .doGoogleLogin()
            .then(() => this.redirect())
            .catch((err: { message: string }) => {
                this.errorMessage = err.message;
            });
    }
    private redirect(): Promise<boolean> {
        return this.router.navigate(['/server']);
    }
}
