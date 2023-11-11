import { MancalaMove } from '../common/MancalaMove';
import { AwaleRules } from './AwaleRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MancalaDistributionResult, MancalaNode } from '../common/MancalaRules';

export class AwaleOrderedMoveGenerator extends AwaleMoveGenerator {

    public override getListMoves(node: MancalaNode): MancalaMove[] {
        const moves: MancalaMove[] = super.getListMoves(node);
        return this.orderMoves(node, moves);
    }
    private orderMoves(node: MancalaNode, moves: MancalaMove[]): MancalaMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const playerY: number = node.gameState.getOpponentY();
        const opponentY: number = player.value;
        // sort by captured houses
        ArrayUtils.sortByDescending(moves, (move: MancalaMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[playerY][move.distributions[0].x];
            const mancalaDistributionResult: MancalaDistributionResult =
                AwaleRules.get().distributeMove(move, node.gameState, node.getConfig());
            const filledCoords: Coord[] = mancalaDistributionResult.filledCoords;
            const endHouse: Coord = filledCoords[filledCoords.length - 1];
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (endHouse.y === playerY) {
                captured = 0;
                if (toDistribute <= node.gameState.getWidth()) {
                    sameTerritoryValue = 10;
                }
            } else {
                captured = AwaleRules.get().captureIfLegal(endHouse.x, opponentY, node.gameState).capturedSum;
            }
            // Prioritize captured, then moves in same territory, then tries to minimize number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }
}
