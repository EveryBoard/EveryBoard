import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/AuthenticationService';

@Injectable({
    providedIn: 'root',
})
export class MustVerifyEmail implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): boolean {
        const user: {pseudo: string, verified: boolean} = this.authService.getAuthenticatedUser();
        if (user == null || user.pseudo == null || user.verified === true) {
            this.router.navigate(['/login']);
            return false;
        } else {
            return true;
        }
    }
}
