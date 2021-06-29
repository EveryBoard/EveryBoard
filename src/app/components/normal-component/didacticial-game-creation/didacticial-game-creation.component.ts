import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-didacticial-game-creation',
    templateUrl: './didacticial-game-creation.component.html',
})
export class DidacticialGameCreationComponent {

    public selectedGame: string;

    public constructor(public router: Router) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public launchDidacticial(): void {
        this.router.navigate(['didacticial/' + this.selectedGame]);
    }
}
