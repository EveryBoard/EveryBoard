import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicCSSService } from 'src/app/services/DynamicCSSService';
import { GameService } from 'src/app/services/GameService';
import { GameInfo } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
    public readonly games: GameInfo[] = GameInfo.ALL_GAMES().filter((game: GameInfo) => game.display === true);
    public readonly theme: 'dark' | 'light';

    public constructor(private gameService: GameService,
                       private router: Router,
                       themeService: DynamicCSSService) {
        this.theme = themeService.getTheme();
    }
    public async createGame(game: string): Promise<boolean> {
        return this.gameService.createGameAndRedirectOrShowError(game);
    }
    public createLocalGame(game: string): void {
        this.router.navigate(['/local/' + game]);
    }
    public createTutorial(game: string): void {
        this.router.navigate(['/tutorial/' + game]);
    }
}
