import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { DiaballikNode } from './DiaballikRules';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { Player } from 'src/app/jscaip/Player';

export class DiaballikDistanceHeuristic extends PlayerMetricHeuristic<DiaballikMove, DiaballikState> {

    public getMetrics(node: DiaballikNode): [number, number] {
        const state: DiaballikState = node.gameState;
        // Inverse of ball distance, i.e., higher if the ball is closest to opponent line
        const ballsCloseness: [number, number] = [-1, -1];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: DiaballikPiece = coordAndContent.content;
            if (piece.holdsBall) {
                if (piece.owner === Player.ZERO) {
                    ballsCloseness[0] = state.board.length - 1 - coordAndContent.coord.y;
                } else {
                    ballsCloseness[1] = coordAndContent.coord.y;
                }
            }
        }
        return ballsCloseness;
    }
}
