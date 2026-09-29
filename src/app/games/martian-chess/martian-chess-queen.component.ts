import { NgClass } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';

import { MartianChessComponentUtils } from './MartianChessComponentUtils';
import { MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-queen]',
    templateUrl: './martian-chess-queen.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class MartianChessQueenComponent {

    public readonly mainShapeId: InputSignal<string | undefined> = input<string>();
    public readonly pieceClasses: InputSignal<string[]> = input.required<string[]>();
    public readonly style: InputSignal<MartianChessFace> = input.required<MartianChessFace>();

    public readonly MartianChessComponentUtils: typeof MartianChessComponentUtils = MartianChessComponentUtils;
    public readonly HEPTAGON: string = MartianChessComponentUtils.getRegularPolygon(7);
    public readonly EIGHT_POINTED_STAR: string = MartianChessComponentUtils.getNPointedStar(8, 0);
    public readonly horizontalDotsRadius: number = MartianChessComponentUtils.SPACE_SIZE / 15;
}
