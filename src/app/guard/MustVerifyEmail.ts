import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { assert } from 'src/app/utils/utils/utils';
import { AuthenticationService, AuthUser } from '../services/authentication/AuthenticationService';

@Injectable({
    providedIn: 'root',
})
export class MustVerifyEmail implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): Promise<boolean> {
        return new Promise((resolve: (value: boolean) => void) => {
            this.authService.getJoueurObs().subscribe((user: AuthUser) => {
                if (user === AuthenticationService.NOT_AUTHENTICATED) {
                    console.log('Authentication incoming!');
                } else {
                    resolve(this.evaluateUserPermission(user));
                }
            });
        });
    }
    private evaluateUserPermission(user: AuthUser): boolean {
        assert(user !== AuthenticationService.NOT_AUTHENTICATED,
               'Evaluation of user called too soon, auth service is not done yet!');
        if (user === AuthenticationService.NOT_AUTHENTICATED ||
            user === AuthenticationService.NOT_CONNECTED ||
            user.verified === true)
        {
            this.router.navigate(['/login']);
            return false;
        } else {
            return true;
        }
    }
}
