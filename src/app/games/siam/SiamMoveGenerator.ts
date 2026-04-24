import { MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Player } from '../../jscaip/Player';

import { SiamMove } from './SiamMove';
import { SiamPiece } from './SiamPiece';
import { SiamRules, SiamNode, SiamConfig } from './SiamRules';
import { SiamState } from './SiamState';

export class SiamMoveGenerator extends MoveGenerator<SiamMove, SiamState, SiamConfig> {

    public override getListMoves(node: SiamNode, config: SiamConfig): SiamMove[] {
        let moves: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            const piece: SiamPiece = coordAndContent.content;
            if (piece.belongsTo(currentPlayer)) {
                moves = moves.concat(SiamRules.get().getMovesFrom(node.gameState,
                                                                  piece,
                                                                  coordAndContent.coord.x,
                                                                  coordAndContent.coord.y));
            }
        }
        if (node.gameState.countCurrentPlayerPawn() < config.numberOfPiece) {
            // up to 44 insertions
            // we remove some legal but useless insertions as explained below
            for (const insertion of SiamRules.get().getInsertions(node.gameState, config)) {
                if (insertion.direction.get().getOpposite() === insertion.landingOrientation) {
                    // this is an insertion with an orientation opposite to its direction,
                    // these are always a useless move and we don't want to take them into account here
                    continue;
                } else if (node.gameState.isEdge(insertion.coord) &&
                           insertion.direction.get() !== insertion.landingOrientation)
                {
                    // this insertion is made in the corner but is not forward, so it cannot push
                    // there is always an equivalent insertion from the other entrance to the same corner,
                    // but the other one is able to push so it is strictly better
                    continue;
                } else {
                    moves.push(insertion);
                }
            }
        }
        return moves;
    }
}
