import { Rules } from 'src/app/jscaip/Rules';
import { MancalaState } from './MancalaState';
import { Move } from 'src/app/jscaip/Move';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

export abstract class MancalaComponent<R extends Rules<M, MancalaState>, M extends Move>
    extends RectangularGameComponent<R, M, MancalaState, number>
{
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.scores = MGPOptional.of([0, 0]);
    }
    public last: MGPOptional<Coord> = MGPOptional.empty();

    public captured: Table<number> = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    protected filledHouses: Coord[] = [];

    protected hidePreviousMove(): void {
        this.captured = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        this.filledHouses = [];
    }
    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const homeColor: string = 'player' + (y + 1) % 2 + '-fill';
        if (this.captured[y][x] > 0) {
            return ['captured-fill', 'moved-stroke'];
        } else if (this.last.equalsValue(coord)) {
            return ['moved-stroke', 'last-move-stroke', homeColor];
        } else if (this.filledHouses.some((c: Coord) => c.equals(coord))) {
            return ['moved-stroke', homeColor];
        } else {
            return [homeColor];
        }
    }
    public getPieceCx(x: number): number {
        return 50 + 100 * x;
    }
    public getPieceCy(y: number): number {
        return 50 + 120 * y;
    }
    public getPieceRotation(x: number, y: number): string {
        return 'rotate(' + this.role.value * 180 + ' ' +
               this.getPieceCx(x) + ' ' +
               this.getPieceCy(y) + ')';
    }
}
