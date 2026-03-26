import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PickGameComponent } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-local-game-creation',
    templateUrl: './local-game-creation.component.html',
    imports: [PickGameComponent]
})
export class LocalGameCreationComponent {

    public constructor(public router: Router) {
    }

    public async pickGame(pickedGame: string): Promise<void> {
        await this.router.navigate(['/local', pickedGame, 'config']);
    }
}
