import { NgClass } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { MartianChessComponentUtils } from '@everyboard/games';

import { MartianChessFace } from './martian-chess.component';

@Component({
    selector: '[app-martian-chess-pawn]',
    templateUrl: './martian-chess-pawn.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class MartianChessPawnComponent {

    public readonly mainShapeId: InputSignal<string | undefined> = input<string>();
    public readonly pieceClasses: InputSignal<string[]> = input.required<string[]>();
    public readonly style: InputSignal<MartianChessFace> = input.required<MartianChessFace>();

    public readonly FOUR_POINTED_STAR_DIAGONAL: string = MartianChessComponentUtils.getNPointedStar(4, 45);
    private readonly TRIANGLE_Y_OFFSET: number = this.yOffsetForVerticalCentering();
    public readonly TRIANGLE: string = this.getTriangle();

    public MartianChessComponentUtils: typeof MartianChessComponentUtils = MartianChessComponentUtils;

    public readonly horizontalDotsRadius: number = MartianChessComponentUtils.SPACE_SIZE / 15;

    public getTriangle(): string {
        // The aim of the following computation is to make the shape vertically centered inside the square
        return MartianChessComponentUtils.getRegularPolygon(3, this.TRIANGLE_Y_OFFSET);
    }
    private yOffsetForVerticalCentering(): number {
        const triangleCoords: Coord[] = MartianChessComponentUtils.getRegularPolygonCoords(3);
        const yCoord: number[] = triangleCoords.map((c: Coord) => c.y);
        const upperTriangleY: number = yCoord.reduce((p: number, c: number) => Math.min(p, c));
        const lowerTriangleY: number = yCoord.reduce((p: number, c: number) => Math.max(p, c));
        const lowerFreeRoom: number = upperTriangleY;
        const upperFreeRoom: number = 100 - lowerTriangleY;
        const halfFreeRoom: number = (lowerFreeRoom + upperFreeRoom) / 4;
        return halfFreeRoom;
    }
    public getConcreteTriangleYOffset(): number {
        if (this.style().shape === 'Polygon') {
            return this.TRIANGLE_Y_OFFSET;
        } else {
            return 0;
        }
    }
}
