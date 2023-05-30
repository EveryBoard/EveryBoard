import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { ObservedPart } from '../domain/User';
import { ObservedPartService } from '../services/ObservedPartService';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard implements CanActivate {

    protected observedPartSubscription: MGPOptional<Subscription> = MGPOptional.empty();

    public constructor(private readonly observedPartService: ObservedPartService,
                       private readonly router: Router)
    {
    }
    public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const observedPart: MGPOptional<ObservedPart> = this.observedPartService.getObservedPart();
        if (observedPart.isAbsent()) {
            return true;
        }
        const part: ObservedPart = observedPart.get();
        if (route.params.id === part.id) {
            return true;
        }
        return this.router.parseUrl('/play/' + part.typeGame + '/' + part.id);
    }
}
