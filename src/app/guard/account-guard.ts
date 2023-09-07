import { Injectable } from '@angular/core';
import { UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';

@Injectable({
    providedIn: 'root',
})
/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard {

    protected userSubscription!: Subscription; // always bound in canActivate

    public constructor(protected readonly connectedUserService: ConnectedUserService) {
    }

    public async canActivate(): Promise<boolean | UrlTree> {
        const result: boolean | UrlTree = await new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.userSubscription = this.connectedUserService.subscribeToUser(async(user: AuthUser) => {
                return resolve(await this.evaluateUserPermission(user));
            });
        });
        this.userSubscription.unsubscribe();
        return result;
    }

    protected abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>
}
