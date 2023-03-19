import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { HiveMove, HiveMoveCoordToCoord } from './HiveMove';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveMinimax extends Minimax<HiveMove, HiveState> {

    public getListMoves(node: HiveNode): HiveMove[] {
        const dropMoves: HiveMove[] = this.getListDrops(node.gameState);
        const movesOnBoard: HiveMove[] = this.getListOfOnBoardMoves(node.gameState);
        const moves: HiveMove[] = dropMoves.concat(movesOnBoard);
        if (moves.length === 0) {
            return [HiveMove.PASS];
        }
        return moves;
    }
    private getListOfOnBoardMoves(state: HiveState): HiveMove[] {
        return HiveRules.get().getPossibleMovesOnBoard(state).toList();
    }
    public getListDrops(state: HiveState): HiveMove[] {
        const drops: HiveMove[] = [];
        for (const coord of HiveRules.get().getPossibleDropLocations(state)) {
            for (const remaining of state.remainingPieces.getPlayerPieces(state.getCurrentPlayer())) {
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
        const scoreZero: number = this.queenBeeMobility(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeMobility(node.gameState, Player.ONE);
        return BoardValue.from(scoreZero, scoreOne);
    }
    private queenBeeMobility(state: HiveState, player: Player): number {
        const queenBee: MGPOptional<Coord> = state.queenBeeLocation(player);
        if (queenBee.isPresent()) {
            const possibleMoves: MGPSet<HiveMoveCoordToCoord> =
                HiveRules.get().getPossibleMovesFrom(state, queenBee.get());
            return possibleMoves.size();
        } else {
            return 0;
        }
    }
}
