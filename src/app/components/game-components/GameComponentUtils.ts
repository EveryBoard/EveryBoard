import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Utils } from 'src/app/utils/utils';

export class GameComponentUtils {
    public static getArrowTransform(caseSize: number, coord: Coord, direction: Orthogonal): string {
        let dx: number;
        let dy: number;
        let angle: number;
        switch (direction) {
            case Orthogonal.UP:
                dx = 0;
                dy = -1;
                angle = -90;
                break;
            case Orthogonal.DOWN:
                dx = 0;
                dy = 1;
                angle = 90;
                break;
            case Orthogonal.LEFT:
                dx = -1;
                dy = 0;
                angle = 180;
                break;
            default:
                Utils.expectToBe(direction, Orthogonal.RIGHT);
                dx = 1;
                dy = 0;
                angle = 0;
                break;
        }
        const rotation: string = `rotate(${angle})`;
        const scaling: string = 'scale(2.5)';
        const realX: number = coord.x * caseSize + caseSize/2 + dx * caseSize/4;
        const realY: number = coord.y * caseSize + caseSize/2 + dy * caseSize/4;
        const translation: string = `translate(${realX} ${realY})`;
        return [translation, scaling, rotation].join(' ');
    }
}
