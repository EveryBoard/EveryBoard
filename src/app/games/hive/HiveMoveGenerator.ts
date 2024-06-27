import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { Player } from 'src/app/jscaip/Player';
import { HiveMove } from './HiveMove';
import { HivePiece } from './HivePiece';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class HiveMoveGenerator extends MoveGenerator<HiveMove, HiveState> {

    public override getListMoves(node: HiveNode, _config: NoConfig): HiveMove[] {
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

    private getListDrops(state: HiveState): HiveMove[] {
        const drops: HiveMove[] = [];
        const player: Player = state.getCurrentPlayer();
        const queenBee: HivePiece = new HivePiece(player, 'QueenBee');
        for (const coord of HiveRules.get().getPossibleDropLocations(state)) {
            if (HiveRules.get().mustPlaceQueenBee(state)) {
                drops.push(HiveMove.drop(queenBee, coord));
            } else {
                for (const remaining of state.remainingPieces.getPlayerPieces(state.getCurrentPlayer())) {
                    drops.push(HiveMove.drop(remaining, coord));
                }
            }
        }
        return drops;
    }

}
