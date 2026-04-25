import { MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';

import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from './CoerceoMove';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoMoveGenerator extends MoveGenerator<CoerceoMove, CoerceoState, CoerceoConfig> {

    public override getListMoves(node: CoerceoNode, _config: MGPOptional<CoerceoConfig>): CoerceoMove[] {
        let moves: CoerceoMove[] = this.getListExchanges(node);
        moves = moves.concat(this.getListMovement(node));
        return moves;
    }

    public getListExchanges(node: CoerceoNode): CoerceoMove[] {
        const state: CoerceoState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        const opponent: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentOpponent());
        if (state.tiles.get(player) < 2) {
            return [];
        }
        const exchanges: CoerceoMove[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content === opponent) {
                const move: CoerceoMove = CoerceoTileExchangeMove.of(coordAndContent.coord);
                exchanges.push(move);
            }
        }
        return exchanges;
    }

    public getListMovement(node: CoerceoNode): CoerceoMove[] {
        const movements: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const start: Coord = coordAndContent.coord;
            if (coordAndContent.content.is(player)) {
                const legalLandings: Coord[] = state.getLegalLandings(start);
                for (const end of legalLandings) {
                    const move: CoerceoMove = CoerceoRegularMove.of(start, end);
                    movements.push(move);
                }
            }
        }
        return movements;
    }

}
