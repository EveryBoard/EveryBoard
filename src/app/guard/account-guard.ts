import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';

@Injectable({
    providedIn: 'root',
})
/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard implements CanActivate, OnDestroy {

    protected userSubscription!: Subscription; // always bound in canActivate

    constructor(protected readonly connectedUserService: ConnectedUserService) {
    }

    public async canActivate(): Promise<boolean | UrlTree> {
        console.log('(1) AccountGuard.canActivate YONDU')
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.userSubscription = this.connectedUserService.subscribeToUser(async(user: AuthUser) => {
                console.log('(2) AccountGuard.canActivate inside CUS.subscription', JSON.stringify(user))
                return resolve(await this.evaluateUserPermission(user));
            });
        });
    }

    protected abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>

    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }
}
