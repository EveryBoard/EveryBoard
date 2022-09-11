import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { FocusedPart } from '../domain/User';
import { ConnectedUserService } from '../services/ConnectedUserService';
import { MessageDisplayer } from '../services/MessageDisplayer';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard implements CanActivate, OnDestroy {

    protected observedPartSub: MGPOptional<Subscription> = MGPOptional.empty();

    constructor(public readonly connectedUserService: ConnectedUserService,
                public readonly messageDisplayer: MessageDisplayer,
                protected readonly router: Router)
    {
    }
    public async canActivate(): Promise<boolean | UrlTree> {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            const subscription: Subscription = this.connectedUserService
                .subscribeToObservedPart(
                    (optionalPart: MGPOptional<FocusedPart>) => {
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
        if (this.observedPartSub.isPresent()) {
            this.observedPartSub.get().unsubscribe();
        }
    }
}
