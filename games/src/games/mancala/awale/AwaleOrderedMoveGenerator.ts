import { ArrayUtils } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Player } from '../../../jscaip/Player';
import { MancalaConfig } from '../common/MancalaConfig';
import { MancalaMove } from '../common/MancalaMove';
import { MancalaDistributionResult, MancalaNode } from '../common/MancalaRules';

import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { AwaleRules } from './AwaleRules';

export class AwaleOrderedMoveGenerator extends AwaleMoveGenerator {

    public override getListMoves(node: MancalaNode, config: MancalaConfig): MancalaMove[] {
        const moves: MancalaMove[] = super.getListMoves(node, config);
        return this.orderMoves(node, moves, config);
    }

    private orderMoves(node: MancalaNode, moves: MancalaMove[], config: MancalaConfig): MancalaMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        // sort by captured houses
        ArrayUtils.sortByDescending(moves, (move: MancalaMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[move.getFirstDistribution().y][move.getFirstDistribution().x];
            const mancalaDistributionResult: MancalaDistributionResult =
                AwaleRules.get().distributeMove(move, node.gameState, config);
            const filledCoords: Coord[] = mancalaDistributionResult.filledCoords;
            const endHouse: Coord = filledCoords[filledCoords.length - 1];
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (AwaleRules.get().getSpaceOwner(endHouse, config) === player) {
                captured = AwaleRules.get().captureIfLegal(endHouse.x, endHouse.y, node.gameState, config).capturedSum;
            } else {
                captured = 0;
                if (toDistribute <= node.gameState.getWidth()) {
                    sameTerritoryValue = 10;
                }
            }
            // Prioritize captured, then moves in same territory, then tries to minimize number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }

}
