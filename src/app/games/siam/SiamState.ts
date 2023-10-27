import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { SiamPiece } from './SiamPiece';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';

export class SiamState extends GameStateWithTable<SiamPiece> {

    public static readonly SIZE: number = 5;

    public static getInitialState(): SiamState {
        const board: SiamPiece[][] = TableUtils.create(SiamState.SIZE, SiamState.SIZE, SiamPiece.EMPTY);

        board[2][1] = SiamPiece.MOUNTAIN;
        board[2][2] = SiamPiece.MOUNTAIN;
        board[2][3] = SiamPiece.MOUNTAIN;

        return new SiamState(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(SiamState.SIZE, SiamState.SIZE);
    }
    public countCurrentPlayerPawn(): number {
        return this.countPlayersPawn()[this.getCurrentPlayer().getValue()];
    }
    public countPlayersPawn(): [number, number] {
        const counts: [number, number] = [0, 0];
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content !== SiamPiece.EMPTY) {
                counts[coordAndContent.content.getOwner().getValue()]++;
            }
        }
        return counts;
    }
}
