import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosDummyMinimax extends PlayerMetricsMinimax<ApagosMove, ApagosState> {

    public getListMoves(node: ApagosNode): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
    public getMetrics(node: ApagosNode): [number, number] {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const metrics: [number, number] = [0, 0];
        if (levelThreeDominant.isPlayer()) {
            metrics[levelThreeDominant.value] = 1;
        }
        return metrics;
    }
}
