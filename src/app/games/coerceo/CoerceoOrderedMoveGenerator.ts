import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { ArrayUtils } from '@everyboard/lib';
import { CoerceoMoveGenerator } from './CoerceoMoveGenerator';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class CoerceoOrderedMoveGenerator extends CoerceoMoveGenerator {

    override getListMoves(node: CoerceoNode, config: NoConfig): CoerceoMove[] {
        const moves: CoerceoMove[] = super.getListMoves(node, config);
        return this.putCaptureFirst(node, moves);
    }

    public putCaptureFirst(node: CoerceoNode, moves: CoerceoMove[]): CoerceoMove[] {
        ArrayUtils.sortByDescending(moves, (move: CoerceoMove) => {
            return this.moveCapturesList(node, move).length;
        });
        return moves;
    }
    public moveCapturesList(node: CoerceoNode, move: CoerceoMove): Coord[] {
        if (CoerceoMove.isTileExchange(move)) {
            return [move.coord];
        } else {
            // Move the piece
            const afterMovement: CoerceoState = node.gameState.applyLegalMovement(move);
            // removes emptied tiles
            const afterTilesRemoved: CoerceoState = afterMovement.removeTilesIfNeeded(move.getStart(), true);
            return afterTilesRemoved.getCapturedNeighbors(move.getEnd());
        }
    }
}
