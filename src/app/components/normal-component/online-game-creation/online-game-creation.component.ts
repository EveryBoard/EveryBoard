import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { GameService } from 'src/app/services/GameService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { GameInfo } from '../pick-game/pick-game.component';
import { GameWrapperMessages } from '../../wrapper-components/GameWrapper';
import { CurrentGameService } from 'src/app/services/CurrentGameService';

@Component({
    selector: 'app-online-game-creation',
    template: '<p i18n>Creating online game, please wait, it should not take long.</p>',
})
export class OnlineGameCreationComponent implements OnInit {

    public constructor(private readonly route: ActivatedRoute,
                       private readonly router: Router,
                       private readonly connectedUserService: ConnectedUserService,
                       private readonly currentGameService: CurrentGameService,
                       private readonly messageDisplayer: MessageDisplayer,
                       private readonly gameService: GameService)
    {
    }

    public async ngOnInit(): Promise<void> {
        await this.createGameAndRedirectOrShowError(this.extractGameFromURL());
    }

    private extractGameFromURL(): string {
        return Utils.getNonNullable(this.route.snapshot.paramMap.get('game'));
    }

    private async createGameAndRedirectOrShowError(game: string): Promise<void> {
        const authUser: AuthUser = this.connectedUserService.user.get();
        Utils.assert(authUser.isConnected(), 'User must be connected and have a username to reach this page');
        if (this.gameExists(game) === false) {
            await this.router.navigate(['/notFound', GameWrapperMessages.NO_MATCHING_GAME(game)], { skipLocationChange: true });
            return;
        }
        const canCreateOnlineGame: MGPValidation = this.currentGameService.canUserCreate();
        if (canCreateOnlineGame.isSuccess()) {
            const gameId: MGPFallible<string> = await this.gameService.createGame(game);
            if (gameId.isFailure()) {
                const error: string = gameId.getReason();
                switch (error) {
                    case 'already-subscribed':
                        // We might arrive here because the "create" message has
                        // been sent before we get the current game update
                        this.messageDisplayer.criticalMessage($localize`You already have another tab open.`);
                        await this.router.navigate(['/']);
                        break;
                    default:
                        this.messageDisplayer.criticalMessage($localize`Unexpected error from backend: ${error}`);
                        await this.router.navigate(['/']);
                        break;
                }
            } else {
                await this.router.navigate(['/play', game, gameId.get()]);
            }
        } else {
            this.messageDisplayer.infoMessage(canCreateOnlineGame.getReason());
            await this.router.navigate(['/lobby']);
        }
    }

    private gameExists(gameName: string): boolean {
        const optionalGameInfo: MGPOptional<GameInfo> = GameInfo.getByUrlName(gameName);
        return optionalGameInfo.isPresent();
    }

}
