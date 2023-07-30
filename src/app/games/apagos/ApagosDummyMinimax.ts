import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosMoveGenerator extends MoveGenerator<ApagosMove, ApagosState> {

    public getListMoves(node: ApagosNode): ApagosMove[] {
        const state: ApagosState = node.gameState;
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return ApagosMove.ALL_MOVES.filter(isLegal);
    }
}

export class ApagosDummyHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public getMetrics(node: ApagosNode): [number, number] {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const metrics: [number, number] = [0, 0];
        if (levelThreeDominant.isPlayer()) {
            metrics[levelThreeDominant.value] = 1;
        }
        return metrics;
    }
}

export class ApagosDummyMinimax extends Minimax<ApagosMove, ApagosState> {

    public constructor() {
        super('DummyMinimax', ApagosRules.get(), new ApagosDummyHeuristic(), new ApagosMoveGenerator());
    }
}
