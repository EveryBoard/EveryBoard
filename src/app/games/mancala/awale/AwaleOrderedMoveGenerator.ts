import { MancalaState } from '../common/MancalaState';
import { AwaleMove } from './AwaleMove';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MancalaDistributionResult } from '../common/MancalaRules';

export class AwaleOrderedMoveGenerator extends AwaleMoveGenerator {

    public override getListMoves(node: AwaleNode): AwaleMove[] {
        const moves: AwaleMove[] = super.getListMoves(node);
        return this.orderMoves(node, moves);
    }
    private orderMoves(node: AwaleNode, moves: AwaleMove[]): AwaleMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const playerY: number = node.gameState.getOpponentY();
        const opponentY: number = player.value;
        // sort by captured houses
        ArrayUtils.sortByDescending(moves, (move: AwaleMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[playerY][move.x];
            const mancalaDistributionResult: MancalaDistributionResult =
                AwaleRules.get().distributeMove(move, node.gameState);
            const filledCoords: Coord[] = mancalaDistributionResult.filledCoords;
            const endHouse: Coord = filledCoords[filledCoords.length - 1];
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (endHouse.y === playerY) {
                captured = 0;
                if (toDistribute <= MancalaState.WIDTH) {
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
