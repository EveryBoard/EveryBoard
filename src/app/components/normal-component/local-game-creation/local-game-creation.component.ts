import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-local-game-creation',
    templateUrl: './local-game-creation.component.html',
})
export class LocalGameCreationComponent {

    public selectedGame: string;

    public constructor(public router: Router) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async playLocally(): Promise<void> {
        await this.router.navigate(['local/' + this.selectedGame]);
    }
}
