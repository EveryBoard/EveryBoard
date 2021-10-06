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
            this.errorMessage = result.getReason();
        }
    }
    public async loginWithGoogle(): Promise<void> {
        const result: MGPValidation = await this.authenticationService.doGoogleLogin();
        if (result.isSuccess()) {
            await this.redirect();
        } else {
            this.errorMessage = result.getReason();
        }
    }
    private redirect(): Promise<boolean> {
        return this.router.navigate(['/server']);
    }
}
