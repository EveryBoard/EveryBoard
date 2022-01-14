import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

@Injectable({
    providedIn: 'root',
})
/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard implements CanActivate, OnDestroy {
    private userSub!: Subscription; // always bound in canActivate
    constructor(private readonly authService: AuthenticationService) {
    }
    public async canActivate(): Promise<boolean | UrlTree > {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.userSub = this.authService.getUserObs().subscribe(async(user: AuthUser) => {
                await this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    protected abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>

    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }
}
