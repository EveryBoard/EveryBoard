import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { HiveMove } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveMinimax extends Minimax<HiveMove, HiveState> {

    public getListMoves(node: HiveNode): HiveMove[] {
        return this.getListDrops(node.gameState)
            .concat(HiveRules.get().getPossibleMovesOnBoard(node.gameState).toList());
    }

    public getListDrops(state: HiveState): HiveMove[] {
        const drops: HiveMove[] = [];
        for (const coord of HiveRules.get().getPossibleDropLocations(state)) {
            for (const remaining of state.remainingPieces.getAllRemaining(state.getCurrentPlayer())) {
                drops.push(HiveMove.drop(remaining, coord));
            }
        }
        return drops;
    }

    public getBoardValue(node: HiveNode): BoardValue {
        // The board value is based on the number of neighbors to the queen
        const status: GameStatus = HiveRules.get().getGameStatus(node);
        if (status !== GameStatus.ONGOING) {
            return new BoardValue(status.toBoardValue());
        }
        const scoreZero: number = this.queenBeeNeighbors(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeNeighbors(node.gameState, Player.ONE);
        return new BoardValue(scoreZero * Player.ZERO.getScoreModifier() + scoreOne * Player.ONE.getScoreModifier());
    }

    private queenBeeNeighbors(state: HiveState, player: Player): number {
        const queenBee: MGPOptional<Coord> = state.queenBeeLocation(player);
        if (queenBee.isPresent()) {
            return state.numberOfNeighbors(queenBee.get());
        } else {
            return 0;
        }
    }
}
