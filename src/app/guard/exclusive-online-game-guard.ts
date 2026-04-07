import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';

import { MGPOptional } from '@everyboard/lib';

import { CurrentGame } from '../domain/User';
import { CurrentGameService } from '../services/CurrentGameService';

@Injectable({
    providedIn: 'root',
})
export class ExclusiveOnlineGameGuard {

    private readonly currentGameService: CurrentGameService = inject(CurrentGameService);
    private readonly router: Router = inject(Router);

    protected currentGameSubscription: MGPOptional<Subscription> = MGPOptional.empty();

    public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        const currentGame: MGPOptional<CurrentGame> = await this.currentGameService.getCurrentGame();
        if (currentGame.isAbsent()) {
            return true;
        }
        const game: CurrentGame = currentGame.get();
        if (route.params.id === game.id) {
            return true;
        }
        return this.router.parseUrl('/play/' + game.gameName + '/' + game.id);
    }
}
