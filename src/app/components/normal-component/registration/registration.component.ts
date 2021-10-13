import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import firebase from 'firebase/app';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
})
export class RegistrationComponent {
    public faEye: IconDefinition = faEye;

    @ViewChild('password') passwordInput: ElementRef<HTMLElement>;

    private passwordShown: boolean = false;

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
            console.log(emailResult)
            if (emailResult.isSuccess()) {
                return this.router.navigate(['/verify-account']);
            } else {
                this.errorMessage = emailResult.getReason();
            }
        } else {
            this.errorMessage = registrationResult.getReason();
        }
    }

    public togglePasswordVisibility(): void {
        if (this.passwordShown) {
            this.passwordShown = false;
            this.passwordInput.nativeElement.setAttribute('type', 'password');
        } else {
            this.passwordShown = true;
            this.passwordInput.nativeElement.setAttribute('type', 'text');
        }
    }
}
