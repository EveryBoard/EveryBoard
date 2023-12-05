import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched, ReversiConfig } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class ReversiOrderedMoveGenerator extends MoveGenerator<ReversiMove, ReversiState, ReversiConfig> {

    public getBestCoords(config: ReversiConfig): Coord[] {
        return [
            new Coord(0, 0),
            new Coord(0, config.height - 1),
            new Coord(config.width - 1, 0),
            new Coord(config.width - 1, config.height - 1),
        ];
    }

    public getListMoves(node: ReversiNode, optionalConfig: MGPOptional<ReversiConfig>): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.get().getListMoves(node.gameState, optionalConfig);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        const config: ReversiConfig = optionalConfig.get();
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
