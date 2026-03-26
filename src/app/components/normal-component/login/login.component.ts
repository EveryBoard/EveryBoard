import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { MGPValidation } from '@everyboard/lib';

import { AutofocusDirective } from '../../../pipes-and-directives/autofocus.directive';
import { ToggleVisibilityDirective } from '../../../pipes-and-directives/toggle-visibility.directive';
import { ConnectedUserService, AuthUser } from '../../../services/ConnectedUserService';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    imports: [ReactiveFormsModule, AutofocusDirective, FaIconComponent, ToggleVisibilityDirective, NgIf, RouterLink],
})
export class LoginComponent implements OnInit, OnDestroy {
    router = inject(Router);
    connectedUserService = inject(ConnectedUserService);


    public faEye: IconDefinition = faEye;

    public errorMessage: string;

    public loginForm: FormGroup = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });

    private userSubscription!: Subscription;
    public ngOnInit(): void {
        this.userSubscription = this.connectedUserService.subscribeToUser(async(user: AuthUser) => {
            if (user !== AuthUser.NOT_CONNECTED) {
                await this.redirect();
            }
        });
    }
    public async loginWithEmail(value: {email: string, password: string}): Promise<void> {
        const result: MGPValidation = await this.connectedUserService.doEmailLogin(value.email, value.password);
        if (result.isFailure()) {
            this.errorMessage = result.getReason();
        }
    }
    public async loginWithGoogle(): Promise<void> {
        const result: MGPValidation = await this.connectedUserService.doGoogleLogin();
        if (result.isFailure()) {
            this.errorMessage = result.getReason();
        }
    }
    private async redirect(): Promise<boolean> {
        return this.router.navigate(['/lobby']);
    }
    public canLogin(): boolean {
        const email: string = this.loginForm.value.email ?? '';
        const password: string = this.loginForm.value.password ?? '';
        if (email === '' || password === '') {
            return false;
        }
        return true;
    }
    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }
}
