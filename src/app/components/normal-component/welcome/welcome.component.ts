import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faNetworkWired, faDesktop, faBookOpen, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { CurrentGameService } from '../../../services/CurrentGameService';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { ThemeService } from '../../../services/ThemeService';
import { GameInfo, PickGameComponent } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    imports: [RouterLink, NgIf, FaIconComponent, PickGameComponent],
})
export class WelcomeComponent {

    public readonly router: Router = inject(Router);
    public readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);
    public readonly currentGameService: CurrentGameService = inject(CurrentGameService);

    public readonly numberOfColumns: number = 5;
    public readonly games: GameInfo[][] = [];
    public readonly theme: 'dark' | 'light';
    public readonly iconOnlineGame: IconDefinition = faNetworkWired;
    public readonly iconLocalGame: IconDefinition = faDesktop;
    public readonly iconTutorial: IconDefinition = faBookOpen;

    public gameInfoDetails: MGPOptional<GameInfo> = MGPOptional.empty();

    public constructor()
    {
        this.theme = inject(ThemeService).getTheme();
        const allGames: GameInfo[] = GameInfo.getAllGames();
        let column: number = 0;
        for (let i: number = 0; i < allGames.length; i++) {
            if (i < this.numberOfColumns) {
                this.games.push([]);
            }
            this.games[column].push(allGames[i]);
            column = (column + 1) % this.numberOfColumns;
        }
    }

    public async createGame(game?: string): Promise<boolean> {
        const canCreateGame: MGPValidation = this.currentGameService.canUserCreate();
        if (canCreateGame.isSuccess()) {
            if (game == null) {
                return this.router.navigate(['/play']);
            } else {
                return this.router.navigate(['/play', game]);
            }
        } else {
            this.messageDisplayer.criticalMessage(canCreateGame.getReason());
            return false;
        }
    }

    public async createLocalGame(game: string): Promise<boolean> {
        return this.router.navigate(['/local', game, 'config']);
    }

    public createTutorial(game: string): Promise<boolean> {
        return this.router.navigate(['/tutorial', game]);
    }

    public pickGame(game: string): void {
        this.gameInfoDetails = GameInfo.getByUrlName(game);
    }

    public closeInfo(): void {
        this.gameInfoDetails = MGPOptional.empty();
    }
}
