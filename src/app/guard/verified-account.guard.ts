import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { AccountGuard } from './account-guard';

@Injectable({
    providedIn: 'root',
})
export class VerifiedAccountGuard extends AccountGuard {

    public static async evaluateUserPermission(router: Router, user: AuthUser): Promise<boolean | UrlTree> {
        if (user.isConnected() === false) {
            // Redirects the user to the login page
            return router.parseUrl('/login');
        } else if (user.verified === false) {
            // Redirects the user to the account verification page
            return router.parseUrl('/verify-account');
        } else {
            return true;
        }
    }
    public constructor(connectedUserService: ConnectedUserService,
                       protected readonly router: Router)
    {
        super(connectedUserService);
    }
    public async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        return VerifiedAccountGuard.evaluateUserPermission(this.router, user);
    }
}
