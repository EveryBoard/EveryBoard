import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
})
export class OnlineGameSelectionComponent {

    public selectedGame: string;

    public constructor(private readonly router: Router) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async navigateToOnlineGameCreation(): Promise<void> {
        // TODOTODO dire au frikin CanActivate thingy de bloquer en amont, car ici rien est bloqué hé !
        await this.router.navigate(['/play', this.selectedGame]);
    }
}
