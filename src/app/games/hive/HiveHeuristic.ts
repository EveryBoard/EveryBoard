import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional, Set } from '@everyboard/lib';
import { HiveMove, HiveCoordToCoordMove } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class HiveHeuristic extends PlayerMetricHeuristic<HiveMove, HiveState> {

    public override getMetrics(node: HiveNode, _config: NoConfig): PlayerNumberTable {
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
