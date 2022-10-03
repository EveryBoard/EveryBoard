import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { FocusedPart } from '../domain/User';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { MessageDisplayer } from '../services/MessageDisplayer';
import { ObservedPartService } from '../services/ObservedPartService';
import { MGPOptional } from '../utils/MGPOptional';
import { VerifiedAccountGuard } from './verified-account.guard';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard extends VerifiedAccountGuard implements OnDestroy {

    protected observedPartSubscription: MGPOptional<Subscription> = MGPOptional.empty();

    constructor(connectedUserService: ConnectedUserService,
                public readonly messageDisplayer: MessageDisplayer,
                public readonly observedPartService: ObservedPartService,
                protected readonly router: Router)
    {
        super(connectedUserService, router);
    }
    public async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        console.log('(3) ExclusiveOnlineGameGuard.evaluateUserPermission')
        // Could be VerifiedAccountGuard.evaluateUserPermission ?
        const isVerified: boolean | UrlTree = await super.evaluateUserPermission(user);

        if (isVerified !== true) {
            return isVerified;
        }
        return this.evaluateUserPermissionBasedOnHisObservedPart();
    }
    public async evaluateUserPermissionBasedOnHisObservedPart(): Promise<boolean | UrlTree> {
        console.log('(6) ExclusiveOnlineGameGuard.evaluateUserPermissionBasedOnHisObservedPart')
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            const subscription: Subscription = this.observedPartService
                .subscribeToObservedPart((optionalPart: MGPOptional<FocusedPart>) => {
                    if (optionalPart.isAbsent()) {
                        console.log('(7) Exclusive >>> allezGo')
                        return resolve(true);
                    }
                    const part: FocusedPart = optionalPart.get();
                    console.log('(7) Exclusive >>> REDIRECT!')
                    // return this.router.navigate(['/play', part.typeGame, part.id]);
                    return resolve(this.router.parseUrl('/play/' + part.typeGame + '/' + part.id));
                });
            if (this.observedPartSubscription.isPresent()) {
                console.log('YONDU ! DOUBLE SUBSCRIPURE !');
            }
            this.observedPartSubscription = MGPOptional.of(subscription);
        });
    }
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.observedPartSubscription.isPresent()) {
            this.observedPartSubscription.get().unsubscribe();
        }
    }
}
