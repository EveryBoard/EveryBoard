import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import firebase from 'firebase/app';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent {

    public faEye: IconDefinition = faEye;

    public errorMessage: string;

    public registrationForm: FormGroup = new FormGroup({
        email: new FormControl(),
        username: new FormControl(),
        password: new FormControl(),
    });

    constructor(public authService: AuthenticationService,
                public router: Router) {}

    public async registerWithEmail(): Promise<void> {
        const username: string | null = this.registrationForm.value.username;
        const email: string | null = this.registrationForm.value.email;
        const password: string | null = this.registrationForm.value.password;
        const registrationResult: MGPFallible<firebase.User> =
            await this.authService.doRegister(username, email, password);
        if (registrationResult.isSuccess()) {
            const emailResult: MGPValidation =
                await this.authService.sendEmailVerification();
            if (emailResult.isSuccess()) {
                await this.router.navigate(['/verify-account']);
            } else {
                this.errorMessage = emailResult.getReason();
            }
        } else {
            this.errorMessage = registrationResult.getReason();
        }
    }
    public async registerWithGoogle(): Promise<void> {
        const result: MGPValidation = await this.authService.doGoogleLogin();
        if (result.isSuccess()) {
            await this.router.navigate(['/verify-account']);
        } else {
            this.errorMessage = result.getReason();
        }
    }
    public getPasswordHelpClass(): string {
        const password: string = this.registrationForm.value.password;
        if (password == null || password === '') {
            return '';
        }
        if (password.length < 6) {
            return 'is-danger';
        }
        return 'is-success';
    }
}
