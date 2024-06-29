import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Player } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MGPOptional } from '@everyboard/lib';

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
