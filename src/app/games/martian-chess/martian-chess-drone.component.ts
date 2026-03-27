import { NgIf, NgClass } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';

import { MartianChessComponentUtils } from './MartianChessComponentUtils';
import { MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-drone]',
    templateUrl: './martian-chess-drone.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgIf, NgClass],
})
export class MartianChessDroneComponent {

    readonly mainShapeId: InputSignal<string | undefined> = input<string>();
    readonly pieceClasses: InputSignal<string[]> = input.required<string[]>();
    readonly style: InputSignal<MartianChessFace> = input.required<MartianChessFace>();

    public readonly MartianChessComponentUtils: typeof MartianChessComponentUtils = MartianChessComponentUtils;
    public readonly FOUR_POINTED_STAR_VERTICAL: string = MartianChessComponentUtils.getNPointedStar(4, 0);
    public readonly PENTAGON: string = MartianChessComponentUtils.getRegularPolygon(5);

    public readonly horizontalDotsRadius: number = MartianChessComponentUtils.SPACE_SIZE / 15;
}
