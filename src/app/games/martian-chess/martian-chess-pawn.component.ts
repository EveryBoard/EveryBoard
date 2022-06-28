import { Component, Input } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { MartianChessComponent, MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-pawn]',
    templateUrl: './martian-chess-pawn.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class MartianChessPawnComponent {

    @Input() mainShapeId: string;
    @Input() pieceClasses: string[];
    @Input() style: MartianChessFace;

    public static FOUR_POINTED_STAR_DIAGONAL: string = MartianChessComponent.getNPointedStar(4, 45);
    private static readonly TRIANGLE_Y_OFFSET: number = MartianChessPawnComponent.yOffsetForVerticalCentering();
    public static TRIANGLE: string = MartianChessPawnComponent.getTriangle();

    public MartianChessComponent: typeof MartianChessComponent = MartianChessComponent;
    public MartianChessPawnComponent: typeof MartianChessPawnComponent = MartianChessPawnComponent;

    public readonly horizontalDotsRadius: number = MartianChessComponent.SPACE_SIZE / 15;

    public static getTriangle(): string {
        // The aim of the following computation is to make the shape vertically centered inside the square
        return MartianChessComponent.getRegularPolygon(3, MartianChessPawnComponent.TRIANGLE_Y_OFFSET);
    }
    private static yOffsetForVerticalCentering() {
        const triangleCoords: Coord[] = MartianChessComponent.getRegularPolygonCoords(3);
        const yCoord: number[] = triangleCoords.map((c: Coord) => c.y);
        const upperTriangleY: number = yCoord.reduce((p: number, c: number) => Math.min(p, c));
        const lowerTriangleY: number = yCoord.reduce((p: number, c: number) => Math.max(p, c));
        const lowerFreeRoom: number = upperTriangleY;
        const upperFreeRoom: number = 100 - lowerTriangleY;
        const halfFreeRoom: number = (lowerFreeRoom + upperFreeRoom) / 4;
        return halfFreeRoom;
    }
    public getConcreteTriangleYOffset(): number {
        if (this.style.shape === 'Polygon') {
            return MartianChessPawnComponent.TRIANGLE_Y_OFFSET;
        } else {
            return 0;
        }
    }
}
