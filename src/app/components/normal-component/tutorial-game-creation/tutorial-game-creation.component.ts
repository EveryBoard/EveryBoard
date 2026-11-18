import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { PickGameComponent } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-tutorial-game-creation',
    templateUrl: './tutorial-game-creation.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PickGameComponent],
})
export class TutorialGameCreationComponent {

    private readonly router: Router = inject(Router);

    public async pickGame(pickedGame: string): Promise<void> {
        await this.router.navigate(['/tutorial/', pickedGame]);
    }
}
