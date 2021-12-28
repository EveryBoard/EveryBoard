import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/services/GameService';
import { Utils } from 'src/app/utils/utils';

@Component({
    selector: 'app-online-game-creation',
    template: '<p i18n>Creating online game, please wait, it should not take long.</p>',
})
export class OnlineGameCreationComponent implements OnInit {

    public constructor(private route: ActivatedRoute,
                       private gameService: GameService) {
    }
    public async ngOnInit(): Promise<void> {
        await this.createGame(this.extractGameFromURL());
    }
    private extractGameFromURL(): string {
        return Utils.getNonNullable(this.route.snapshot.paramMap.get('compo'));
    }
    private async createGame(game: string): Promise<boolean> {
        return this.gameService.createGameAndRedirectOrShowError(game);
    }
}
