import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/services/ThemeService';
import { GameInfo } from '../pick-game/pick-game.component';
import { faNetworkWired, faDesktop, faBookOpen, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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

    public constructor(private readonly router: Router,
                       themeService: ThemeService) {
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
    public async createGame(game: string): Promise<boolean> {
        return this.router.navigate(['/play/', game]);
    }
    public createLocalGame(game: string): Promise<boolean> {
        return this.router.navigate(['/local/', game]);
    }
    public createTutorial(game: string): Promise<boolean> {
        return this.router.navigate(['/tutorial/', game]);
    }
    public openInfo(gameInfo: GameInfo): void {
        this.gameInfoDetails = MGPOptional.of(gameInfo);
    }
    public closeInfo(): void {
        this.gameInfoDetails = MGPOptional.empty();
    }
}
