import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { FocusedPart } from '../domain/User';
import { MessageDisplayer } from '../services/MessageDisplayer';
import { ObservedPartService } from '../services/ObservedPartService';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard implements CanActivate, OnDestroy {

    protected observedPartSubscription!: Subscription;

    constructor(public readonly observedPartService: ObservedPartService,
                public readonly messageDisplayer: MessageDisplayer,
                protected readonly router: Router)
    {
    }
    public async canActivate(): Promise<boolean | UrlTree> {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            const subscription: Subscription = this.observedPartService
                .subscribeToObservedPart(
                    (optionalPart: MGPOptional<FocusedPart>) => {
                        if (optionalPart.isAbsent()) {
                            return resolve(true);
                        }
                        const part: FocusedPart = optionalPart.get();
                        return resolve(this.router.parseUrl('/play/' + part.typeGame + '/' + part.id));
                    });
            this.observedPartSubscription = subscription;
        });
    }
    public ngOnDestroy(): void {
        this.observedPartSubscription.unsubscribe();
    }
}
