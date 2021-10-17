import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This is a guard that checks that the user's account has been verified
 */
@Injectable({
    providedIn: 'root',
})
export class VerifiedAccountGuard implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): Promise<boolean | UrlTree > {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.authService.getUserObs().subscribe((user: AuthUser): void => {
                this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    private async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        if (user.isConnected() === false) {
            // Redirects the user to the login page
            console.log('not connected')
            return this.router.parseUrl('/login');
        } else if (user.isVerified() === false) {
            console.log('not verified')
            // Redirects the user to the account verification page
            return this.router.parseUrl('/verify-account');
        } else {
            console.log('verified')
            return true;
        }
    }
}
