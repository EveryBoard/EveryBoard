import { MGPOptional, Set } from '@everyboard/lib';

import { EmptyRulesConfig } from '../../config/RulesConfigUtil';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { HiveMove, HiveCoordToCoordMove } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveHeuristic extends PlayerMetricHeuristic<HiveMove, HiveState> {

    public override getMetrics(node: HiveNode, _config: EmptyRulesConfig): PlayerNumberTable {
        // The board value is based on the number of neighbors to the queen
        const scoreZero: number = this.queenBeeMobility(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeMobility(node.gameState, Player.ONE);
        return PlayerNumberTable.ofSingle(scoreZero, scoreOne);
    }

    private queenBeeMobility(state: HiveState, player: Player): number {
        const queenBee: MGPOptional<Coord> = state.queenBeeLocation(player);
        if (queenBee.isPresent()) {
            const possibleMoves: Set<HiveCoordToCoordMove> =
                HiveRules.get().getPossibleMovesFrom(state, queenBee.get());
            return possibleMoves.size();
        } else {
            return 0;
        }
    }

}
