import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as FireAuth from '@firebase/auth';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { MGPFallible, MGPValidation } from '@everyboard/lib';

import { AutofocusDirective } from '../../../pipes-and-directives/autofocus.directive';
import { ToggleVisibilityDirective } from '../../../pipes-and-directives/toggle-visibility.directive';
import { ConnectedUserService } from '../../../services/ConnectedUserService';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    imports: [ReactiveFormsModule, AutofocusDirective, FaIconComponent, ToggleVisibilityDirective, NgClass, RouterLink],
})
export class RegisterComponent {

    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
    private readonly router: Router = inject(Router);

    public readonly faEye: IconDefinition = faEye;

    public errorMessage: string;

    public registrationForm: FormGroup = new FormGroup({
        email: new FormControl(),
        username: new FormControl(),
        password: new FormControl(),
    });
    public async registerWithEmail(): Promise<void> {
        const username: string | null = this.registrationForm.value.username;
        const email: string | null = this.registrationForm.value.email;
        const password: string | null = this.registrationForm.value.password;
        if (username == null || email == null || password == null) {
            this.errorMessage = $localize`There are missing fields in the registration form, please check that you filled in all fields.`;
        } else {
            const registrationResult: MGPFallible<FireAuth.User> =
                await this.connectedUserService.doRegister(username, email, password);
            if (registrationResult.isSuccess()) {
                const emailResult: MGPValidation =
                    await this.connectedUserService.sendEmailVerification();
                if (emailResult.isSuccess()) {
                    await this.router.navigate(['/verify-account']);
                } else {
                    this.errorMessage = emailResult.getReason();
                }
            } else {
                this.errorMessage = registrationResult.getReason();
            }
        }
    }
    public async registerWithGoogle(): Promise<void> {
        const result: MGPValidation = await this.connectedUserService.doGoogleLogin();
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
    public canRegister(): boolean {
        const password: string = this.registrationForm.value.password ?? '';
        const email: string = this.registrationForm.value.email ?? '';
        const username: string = this.registrationForm.value.username ?? '';
        if (email === '' || username === '' || password === '' || password.length < 6) {
            return false;
        }
        return true;
    }
}
