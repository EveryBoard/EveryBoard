import { ChangeDetectionStrategy, Component, ModelSignal, model } from '@angular/core';

import { Coord } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { AbstractRectangularGoComponent } from '../abstract-rectangular-go/abstract-rectangular-go.component';
import { GoBoardComponent } from '../abstract-rectangular-go/go-board/go-board.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-go',
    templateUrl: '../abstract-rectangular-go/abstract-rectangular-go.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [GoBoardComponent],
})
export class GoComponent extends AbstractRectangularGoComponent {

    public hover: ModelSignal<MGPOptional<Coord>> = model(MGPOptional.empty());

    public constructor() {
        super('Go');
    }

}
