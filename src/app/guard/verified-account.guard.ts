import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';
import { AccountGuard } from './account-guard';

@Injectable({
    providedIn: 'root',
})
export class VerifiedAccountGuard extends AccountGuard {
    constructor(authService: AuthenticationService,
                private readonly router : Router) {
        super(authService);
    }
    protected async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        if (user.isConnected() === false) {
            // Redirects the user to the login page
            return this.router.parseUrl('/login');
        } else if (user.verified === false) {
            // Redirects the user to the account verification page
            return this.router.parseUrl('/verify-account');
        } else {
            return true;
        }
    }
}
