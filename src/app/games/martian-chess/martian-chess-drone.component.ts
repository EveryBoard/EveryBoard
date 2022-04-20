import { Component, Input } from '@angular/core';
import { MartianChessComponent, MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-drone]',
    templateUrl: './martian-chess-drone.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class MartianChessDroneComponent {

    @Input() pieceClasses: string[];
    @Input() style: MartianChessFace;

    public readonly MartianChessComponent: typeof MartianChessComponent = MartianChessComponent;
    public readonly MartianChessDroneComponent: typeof MartianChessDroneComponent = MartianChessDroneComponent;
    public static FOUR_POINTED_STAR_VERTICAL: string = MartianChessComponent.getNPointedStar(4);
    public static PENTAGON: string = MartianChessComponent.getRegularPolygon(5);

    public readonly horizontalDotsRadius: number = MartianChessComponent.SPACE_SIZE / 15;
}
