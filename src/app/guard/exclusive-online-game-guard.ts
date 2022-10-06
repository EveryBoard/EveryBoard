import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { FocusedPart } from '../domain/User';
import { ObservedPartService } from '../services/ObservedPartService';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard implements CanActivate {

    protected userSubscription!: Subscription; // always bound in canActivate

    protected observedPartSubscription: MGPOptional<Subscription> = MGPOptional.empty();

    constructor(private readonly observedPartService: ObservedPartService,
                private readonly router: Router)
    {
    }
    public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const hasPart: boolean | UrlTree = await new Promise((resolve: (value: boolean | UrlTree) => void) => {
            const subscription: Subscription = this.observedPartService
                .subscribeToObservedPart((optionalPart: MGPOptional<FocusedPart>) => {
                    if (optionalPart.isAbsent()) {
                        return resolve(true);
                    }
                    const part: FocusedPart = optionalPart.get();
                    if (route.params.id === part.id) {
                        return resolve(true);
                    }
                    return resolve(this.router.parseUrl('/play/' + part.typeGame + '/' + part.id));
                });
            this.observedPartSubscription = MGPOptional.of(subscription);
        });
        this.observedPartSubscription.get().unsubscribe();
        this.observedPartSubscription = MGPOptional.empty();
        return hasPart;
    }
}
