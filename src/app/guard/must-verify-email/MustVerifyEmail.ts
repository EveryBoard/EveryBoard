import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService, AuthUser } from '../../services/authentication/AuthenticationService';

@Injectable({
    providedIn: 'root',
})
export class MustVerifyEmail implements CanActivate {
    constructor(private authService: AuthenticationService, private router : Router) {
    }
    public canActivate(): Observable<boolean> {
        console.log('canActivate verify eaiml')
        return this.authService.getJoueurObs().pipe(map((user: AuthUser) => {
            if (user == null || user.pseudo == null || user.verified === true) {
                this.router.navigate(['/login']);
                return false;
            } else {
                return true;
            }
        }));
    }
}
