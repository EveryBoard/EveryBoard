import { Component, Input } from '@angular/core';
import { MartianChessComponent, MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-queen]',
    templateUrl: './martian-chess-queen.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class MartianChessQueenComponent {

    @Input() mainShapeId: string;
    @Input() pieceClasses: string[];
    @Input() style: MartianChessFace;

    public static HEPTAGON: string = MartianChessComponent.getRegularPolygon(7);
    public static EIGHT_POINTED_STAR: string = MartianChessComponent.getNPointedStar(8, 0);

    public readonly MartianChessQueenComponent: typeof MartianChessQueenComponent = MartianChessQueenComponent;
    public readonly MartianChessComponent: typeof MartianChessComponent = MartianChessComponent;

    public readonly horizontalDotsRadius: number = MartianChessComponent.SPACE_SIZE / 15;
}
