import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { AccountGuard } from './account-guard';

@Injectable({
    providedIn: 'root',
})
export class NotConnectedGuard extends AccountGuard {
    constructor(authService: ConnectedUserService,
                private readonly router: Router) {
        super(authService);
    }
    protected async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        if (user.isConnected() === false) {
            // Ok, the user can proceed
            return true;
        } else {
            // Redirects the user to the main page, they're already connected!
            return this.router.parseUrl('/');
        }
    }
}
