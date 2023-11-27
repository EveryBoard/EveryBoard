import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from '@everyboard/lib';
import { MGPSet } from '@everyboard/lib';
import { HiveMove, HiveCoordToCoordMove } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveHeuristic extends PlayerMetricHeuristic<HiveMove, HiveState> {

    public getMetrics(node: HiveNode): [number, number] {
        // The board value is based on the number of neighbors to the queen
        const scoreZero: number = this.queenBeeMobility(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeMobility(node.gameState, Player.ONE);
        return [scoreZero, scoreOne];
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
