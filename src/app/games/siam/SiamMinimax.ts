import { SiamMove } from './SiamMove';
import { SiamState } from './SiamState';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { SiamRules, SiamNode, SiamLegalityInformation } from './SiamRules';
import { BoardValue } from 'src/app/jscaip/BoardValue';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamLegalityInformation> {

    public getBoardValue(node: SiamNode): BoardValue {
        return new BoardValue(SiamRules.get().getBoardValueInfo(node.move, node.gameState).boardValue);
    }
    public getListMoves(node: SiamNode): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            const piece: SiamPiece = coordAndContent.content;
            if (piece.belongTo(currentPlayer)) {
                moves = moves.concat(SiamRules.get().getMovesFrom(node.gameState,
                                                                  piece,
                                                                  coordAndContent.coord.x,
                                                                  coordAndContent.coord.y));
            }
        }
        if (node.gameState.countCurrentPlayerPawn() < 5) {
            // up to 44 insertions
            // we remove some legal but useless insertions as explained below
            for (const insertion of SiamRules.get().getInsertions(node.gameState)) {
                if (insertion.direction.get().getOpposite() === insertion.landingOrientation) {
                    // this is an insertion with an orientation opposite to its direction,
                    // these are always a useless move and we don't want to take them into account here
                    continue;
                } else if (this.isOnBorder(insertion) && insertion.direction.get() !== insertion.landingOrientation) {
                    // this insertion is made in the corner but is not forward, so it cannot push
                    // there is always an equivalent insertion from the other entrance to the same corner,
                    // but the other one is able to push so it is strictly better
                    continue;
                } else {
                    moves.push(insertion);
                }
            }
        }
        display(SiamRules.VERBOSE, { getListMovesResult: moves });
        return moves;
    }
    private isOnBorder(insertion: SiamMove): boolean {
        return insertion.coord.x === 0 ||
               insertion.coord.x === 4 ||
               insertion.coord.y === 0 ||
               insertion.coord.y === 4;
    }
}
