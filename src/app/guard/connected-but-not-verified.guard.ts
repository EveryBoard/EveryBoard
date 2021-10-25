import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This is a guard that checks that the user is connected but not verified
 */
@Injectable({
    providedIn: 'root',
})
export class ConnectedButNotVerifiedGuard implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): Promise<boolean | UrlTree > {
        return new Promise((resolve: (value: boolean) => void) => {
            this.authService.getUserObs().subscribe((user: AuthUser): void => {
                this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    private async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        if (user.isConnected() === false) {
            // Redirects the user to the login page
            return this.router.parseUrl('/login');
        } else if (user.verified) {
            // Redirects the user to the main page, it is already verified
            return this.router.parseUrl('/');
        } else {
            return true;
        }
    }
}
