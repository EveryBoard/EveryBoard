import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { PickGameComponent } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-local-game-creation',
    templateUrl: './local-game-creation.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PickGameComponent],
})
export class LocalGameCreationComponent {

    private readonly router: Router = inject(Router);

    public async pickGame(pickedGame: string): Promise<void> {
        await this.router.navigate(['/local', pickedGame, 'config']);
    }
}
