import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tutorial-game-creation',
    templateUrl: './tutorial-game-creation.component.html',
})
export class TutorialGameCreationComponent {

    public selectedGame: string;

    public constructor(public router: Router) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async launchTutorial(): Promise<void> {
        await this.router.navigate(['/tutorial/', this.selectedGame]);
    }
}
