import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { AccountGuard } from './account-guard';

@Injectable({
    providedIn: 'root',
})
export class ConnectedButNotVerifiedGuard extends AccountGuard {
    public constructor(connectedUserService: ConnectedUserService,
                       private readonly router: Router)
    {
        super(connectedUserService);
    }
    protected async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
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
