import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-local-game-creation',
    templateUrl: './local-game-creation.component.html',
    styleUrls: ['./local-game-creation.component.css'],
})
export class LocalGameCreationComponent {

    public selectedGame: string;

    public constructor(public router: Router) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public playLocally(): void {
        this.router.navigate(['local/' + this.selectedGame]);
    }
}
