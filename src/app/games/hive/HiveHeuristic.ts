import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { HiveMove, HiveCoordToCoordMove } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveHeuristic extends PlayerMetricHeuristic<HiveMove, HiveState> {

    public getMetrics(node: HiveNode): PlayerNumberTable {
        // The board value is based on the number of neighbors to the queen
        const scoreZero: number = this.queenBeeMobility(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeMobility(node.gameState, Player.ONE);
        return PlayerNumberTable.of(
            [scoreZero],
            [scoreOne],
        );
    }

    private queenBeeMobility(state: HiveState, player: Player): number {
        const queenBee: MGPOptional<Coord> = state.queenBeeLocation(player);
        if (queenBee.isPresent()) {
            const possibleMoves: MGPSet<HiveCoordToCoordMove> =
                HiveRules.get().getPossibleMovesFrom(state, queenBee.get());
            return possibleMoves.size();
        } else {
            return 0;
        }
    }

}
