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
        return new NodeUnheritance(SiamRules.get().getBoardValueInfo(node.move, node.gameState).boardValue);
    }
    public getListMoves(node: SiamNode): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                const piece: SiamPiece = node.gameState.getPieceAtXY(x, y);
                if (piece.belongTo(currentPlayer)) {
                    moves = moves.concat(SiamRules.get().getMovesFrom(node.gameState, piece, x, y));
                }
            }
        }
        if (node.gameState.countCurrentPlayerPawn() < 5) {
            // up to 44 insertions
            // we remove some legal but useless insertions as explained below
            const insertions = SiamRules.get().getInsertions(node.gameState);
            console.log(`I got ${insertions.length} insertions`);
            for (const insertion of insertions) {
                if (insertion.direction.get().getOpposite() === insertion.landingOrientation) {
                    // this is an insertion with an orientation opposite to its direction,
                    // these are always a useless move and we don't want to take them into account here
                } else if (this.isInCorner(insertion) && insertion.direction.get() !== insertion.landingOrientation) {
                    // this insertion is made in the corner but is not forward, so it cannot push
                    // there is always an equivalent insertion from the other entrance to the same corner,
                    // but the other one is able to push so it is strictly better
                } else {
                    moves.push(insertion);
                }
            }
        }
        display(SiamRules.VERBOSE, { getListMovesResult: moves });
        return moves;
    }
    private isInCorner(insertion: SiamMove): boolean {
        return insertion.coord.x === 0 ||
               insertion.coord.x === 4 ||
               insertion.coord.y === 0 ||
               insertion.coord.y === 4;
    }
}
