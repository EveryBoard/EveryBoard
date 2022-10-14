import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Utils } from 'src/app/utils/utils';

export class GameComponentUtils {
    public static getArrowTransform(boardWidth: number, coord: Coord, direction: Orthogonal): string {
        // The triangle will be wrapped inside a square
        // The board will be considered in this example as a 3x3 on which we place the triangle in (tx, ty)
        let tx: number;
        let ty: number;
        let angle: number;
        switch (direction) {
            case Orthogonal.UP:
                tx = 1;
                ty = 0;
                angle = -90;
                break;
            case Orthogonal.DOWN:
                tx = 1;
                ty = 2;
                angle = 90;
                break;
            case Orthogonal.LEFT:
                tx = 0;
                ty = 1;
                angle = 180;
                break;
            default:
                Utils.expectToBe(direction, Orthogonal.RIGHT);
                tx = 2;
                ty = 1;
                angle = 0;
                break;
        }
        const scale: string = 'scale(' + (boardWidth / 300) + ')';
        const realX: number = tx * 100;
        const realY: number = ty * 100;
        const translation: string = `translate(${realX} ${realY})`;
        const rotation: string = 'rotate(' + angle + ' 50 50)';
        return [scale, translation, rotation].join(' ');
    }
}
