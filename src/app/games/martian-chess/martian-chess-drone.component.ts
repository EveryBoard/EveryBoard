import { Component, Input } from '@angular/core';

import { MartianChessComponent, MartianChessFace } from './martian-chess.component';
import { NgIf, NgClass } from '@angular/common';
import { MartianChessComponentUtils } from './MartianChessComponentUtils';

@Component({
    selector: '[app-martian-chess-drone]',
    templateUrl: './martian-chess-drone.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgIf, NgClass],
})
export class MartianChessDroneComponent {

    @Input() mainShapeId: string;
    @Input() pieceClasses: string[];
    @Input() style: MartianChessFace;

    // TODO: make them all inherit MartianChessComponentUtils (or BaseComponent) instead
    public readonly MartianChessComponentUtils: typeof MartianChessComponentUtils = MartianChessComponentUtils;
    public readonly FOUR_POINTED_STAR_VERTICAL: string = MartianChessComponentUtils.getNPointedStar(4, 0);
    public readonly PENTAGON: string = MartianChessComponentUtils.getRegularPolygon(5);

    public readonly horizontalDotsRadius: number = MartianChessComponentUtils.SPACE_SIZE / 15;
}
