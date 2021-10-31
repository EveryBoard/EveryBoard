import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard implements CanActivate {
    constructor(private authService: AuthenticationService,
                protected router : Router) {
    }
    public canActivate(): Promise<boolean | UrlTree > {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.authService.getUserObs().subscribe((user: AuthUser): void => {
                this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    public abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>
}

@Injectable({
    providedIn: 'root',
})
export class VerifiedAccountGuard extends AccountGuard {
    constructor(authService: AuthenticationService, router : Router) {
        super(authService, router);
    }
    public async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
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
