import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/services/ThemeService';
import { GameInfo } from '../pick-game/pick-game.component';
import { faNetworkWired, faDesktop, faBookOpen, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { MGPValidation } from 'src/app/utils/MGPValidation';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
    public readonly numberOfColumns: number = 4;
    public readonly games: GameInfo[][] = [];
    public readonly theme: 'dark' | 'light';
    public readonly iconOnlineGame: IconDefinition = faNetworkWired;
    public readonly iconLocalGame: IconDefinition = faDesktop;
    public readonly iconTutorial: IconDefinition = faBookOpen;

    public gameInfoDetails: MGPOptional<GameInfo> = MGPOptional.empty();

    public constructor(public readonly router: Router,
                       public readonly messageDisplayer: MessageDisplayer,
                       public readonly observedPartService: ObservedPartService,
                       themeService: ThemeService)
    {
        this.theme = themeService.getTheme();
        const allGames: GameInfo[] = GameInfo.ALL_GAMES().filter((game: GameInfo) => game.display === true);
        let column: number = 0;
        for (let i: number = 0; i < allGames.length; i++) {
            if (i < this.numberOfColumns) {
                this.games.push([]);
            }
            this.games[column].push(allGames[i]);
            column = (column+1) % this.numberOfColumns;
        }
    }
    public async createGame(game?: string): Promise<boolean> {
        const canCreateGame: MGPValidation = this.observedPartService.canUserCreate();
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
        return this.router.navigate(['/local', game]);
    }
    public createTutorial(game: string): Promise<boolean> {
        return this.router.navigate(['/tutorial', game]);
    }
    public openInfo(gameInfo: GameInfo): void {
        this.gameInfoDetails = MGPOptional.of(gameInfo);
    }
    public closeInfo(): void {
        this.gameInfoDetails = MGPOptional.empty();
    }
}
