import { MancalaMove } from '../common/MancalaMove';
import { AwaleRules } from './AwaleRules';
import { ArrayUtils, MGPOptional } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MancalaDistributionResult, MancalaNode } from '../common/MancalaRules';
import { MancalaConfig } from '../common/MancalaConfig';

export class AwaleOrderedMoveGenerator extends AwaleMoveGenerator {

    public override getListMoves(node: MancalaNode, config: MGPOptional<MancalaConfig>): MancalaMove[] {
        const moves: MancalaMove[] = super.getListMoves(node, config);
        return this.orderMoves(node, moves, config.get());
    }

    private orderMoves(node: MancalaNode, moves: MancalaMove[], config: MancalaConfig): MancalaMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const playerY: number = node.gameState.getOpponentY();
        const opponentY: number = player.getValue();
        // sort by captured houses
        ArrayUtils.sortByDescending(moves, (move: MancalaMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[playerY][move.getFirstDistribution().x];
            const mancalaDistributionResult: MancalaDistributionResult =
                AwaleRules.get().distributeMove(move, node.gameState, config);
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
                captured = AwaleRules.get().captureIfLegal(endHouse.x, opponentY, node.gameState, config).capturedSum;
            }
            // Prioritize captured, then moves in same territory, then tries to minimize number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }

}
