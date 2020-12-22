import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication/AuthenticationService';

@Injectable({
    providedIn: 'root',
})
export class EmailVerified implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user: {pseudo: string, verified: boolean} = this.authService.getAuthenticatedUser();
        if (user == null || user.pseudo == null) {
            this.router.navigate(['/login']);
            return false;
        } else if (user.verified === false) {
            this.router.navigate(['/confirm-inscription']);
            return false;
        } else {
            return true;
        }
    }
}
