import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { FocusedPart } from '../domain/User';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { MessageDisplayer } from '../services/MessageDisplayer';
import { MGPOptional } from '../utils/MGPOptional';
import { VerifiedAccountGuard } from './verified-account.guard';

@Injectable({
    providedIn: 'root',
})
export class VerifiedAndNotActiveGuard extends VerifiedAccountGuard implements OnDestroy {

    protected observedPartSub: MGPOptional<Subscription> = MGPOptional.empty();

    constructor(connectedUserService: ConnectedUserService,
                public readonly messageDisplayer: MessageDisplayer,
                protected readonly router: Router)
    {
        super(connectedUserService, router);
    }
    public async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        const isVerified: boolean | UrlTree = await super.evaluateUserPermission(user);
        if (isVerified !== true) {
            return isVerified;
        }
        return this.evaluateUserPermissionBasedOnHisObservedPart();
    }
    public async evaluateUserPermissionBasedOnHisObservedPart(): Promise<boolean | UrlTree> {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            const subscription: Subscription = this.authService
                .getObservedPartObs()
                .subscribe((optionalPart: MGPOptional<FocusedPart>) => {
                    if (optionalPart.isAbsent()) {
                        return resolve(true);
                    }
                    const part: FocusedPart = optionalPart.get();
                    return resolve(this.router.parseUrl('/play/' + part.typeGame + '/' + part.id));
                });
            this.observedPartSub = MGPOptional.of(subscription);
        });
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
        if (this.observedPartSub.isPresent()) {
            this.observedPartSub.get().unsubscribe();
        }
    }
}
