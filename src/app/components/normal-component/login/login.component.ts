import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { faEye, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {

    public faEye: IconDefinition = faEye;

    public errorMessage: string;

    public loginForm: FormGroup = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });

    private userSubscription!: Subscription; // Initialized in ngOnInit

    constructor(public router: Router,
                public connectedUserService: ConnectedUserService) {
    }
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
