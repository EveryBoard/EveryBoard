import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This is a guard that checks that the user's account has been verified
 */
@Injectable({
    providedIn: 'root',
})
export class VerifiedAccount implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): Promise<boolean> {
        return new Promise((resolve: (value: boolean) => void) => {
            this.authService.getJoueurObs().subscribe((user: AuthUser): void => {
                this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    private async evaluateUserPermission(user: AuthUser): Promise<boolean> {
        if (user === AuthenticationService.NOT_CONNECTED) {
            await this.router.navigate(['/login']);
            return false;
        } else if (user.verified === false) {
            await this.router.navigate(['/verify-account']);
            return false;
        } else {
            return true;
        }
    }
}
