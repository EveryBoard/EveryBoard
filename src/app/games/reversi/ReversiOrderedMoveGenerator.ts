import { ArrayUtils, MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';

import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched, ReversiConfig } from './ReversiRules';
import { ReversiState } from './ReversiState';

export class ReversiOrderedMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public getBestCoords(config: ReversiConfig): Coord[] {
        return [
            new Coord(0, 0),
            new Coord(0, config.height - 1),
            new Coord(config.width - 1, 0),
            new Coord(config.width - 1, config.height - 1),
        ];
    }

    public override getListMoves(node: ReversiNode, config: ReversiConfig): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState, config);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        ArrayUtils.sortByDescending(moves, (moveWithSwitched: ReversiMoveWithSwitched): number => {
            if (this.getBestCoords(config).some((coord: Coord): boolean => moveWithSwitched.move.coord.equals(coord))) {
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
