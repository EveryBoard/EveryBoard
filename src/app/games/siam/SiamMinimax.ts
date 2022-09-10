import { SiamMove } from './SiamMove';
import { SiamState } from './SiamState';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { SiamRules, SiamNode, SiamLegalityInformation } from './SiamRules';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamLegalityInformation> {

    public getBoardValue(node: SiamNode): NodeUnheritance {
        return new NodeUnheritance(SiamRules.getBoardValueInfo(node.move, node.gameState).boardValue);
    }
    public getListMoves(node: SiamNode): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                const piece: SiamPiece = node.gameState.getPieceAtXY(x, y);
                if (piece.belongTo(currentPlayer)) {
                    moves = moves.concat(SiamRules.getMovesFrom(node.gameState, piece, x, y));
                }
            }
        }
        if (node.gameState.countCurrentPlayerPawn() < 5) {
            // up to 20 pushing insertion
            moves = moves.concat(SiamRules.getPushingInsertions(node.gameState));
            // up to 24 deraping insertion
            moves = moves.concat(SiamRules.getDerapingInsertions(node.gameState));
        }
        display(SiamRules.VERBOSE, { getListMovesResult: moves });
        return moves;
    }
}
