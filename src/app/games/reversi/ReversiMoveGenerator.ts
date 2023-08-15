import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class ReversiMoveGenerator extends MoveGenerator<ReversiMove, ReversiState> {

    private readonly bestCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, ReversiState.BOARD_HEIGHT - 1),
        new Coord(ReversiState.BOARD_WIDTH - 1, 0),
        new Coord(ReversiState.BOARD_WIDTH - 1, ReversiState.BOARD_HEIGHT - 1),
    ];
    public getListMoves(n: ReversiNode): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.getListMoves(n.gameState);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        ArrayUtils.sortByDescending(moves, (moveWithSwitched: ReversiMoveWithSwitched): number => {
            if (this.bestCoords.some((coord: Coord): boolean => moveWithSwitched.move.coord.equals(coord))) {
                return 100;
            } else {
                return moveWithSwitched.switched;
            }
        });
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }
}
