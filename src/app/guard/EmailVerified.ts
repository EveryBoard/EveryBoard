import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/AuthenticationService';

@Injectable({
    providedIn: 'root'
})
export class EmailVerified implements CanActivate {

    public static VERBOSE: boolean = true;

    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user: {pseudo: string, verified: boolean} = this.authService.getAuthenticatedUser();
        if (user == null || user.pseudo == null) {
            if (EmailVerified.VERBOSE) console.log("t'es pas connecté coonnaer");
            this.router.navigate(["/login"]);
            return false;
        } else if (user.verified === false) {
            if (EmailVerified.VERBOSE) console.log("t'es pas vérifié pottferdeke");
            this.router.navigate(["/confirm-inscription"]);
            return false;
        } else {
            if (EmailVerified.VERBOSE) console.log("vous êtes connectés: " + user.pseudo);
            return true;
        }
    }
}