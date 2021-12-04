import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

    public faEye: IconDefinition = faEye;

    public errorMessage: string;

    public loginForm: FormGroup = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.authenticationService.getUserObs()
            .subscribe(async(user: AuthUser) => {
                if (user !== AuthUser.NOT_CONNECTED) {
                    await this.redirect();
                }
            });
    }
    public async loginWithEmail(value: {email: string, password: string}): Promise<void> {
        const result: MGPValidation = await this.authenticationService.doEmailLogin(value.email, value.password);
        if (result.isFailure()) {
            this.errorMessage = result.getReason();
        }
    }
    public async loginWithGoogle(): Promise<void> {
        const result: MGPValidation = await this.authenticationService.doGoogleLogin();
        if (result.isFailure()) {
            this.errorMessage = result.getReason();
        }
    }
    private async redirect(): Promise<boolean> {
        return this.router.navigate(['/server']);
    }
    public canLogin(): boolean {
        const email: string = this.loginForm.value.email || '';
        const password: string = this.loginForm.value.password || '';
        if (email === '' || password === '') {
            return false;
        }
        return true;
    }
}
