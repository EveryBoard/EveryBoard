import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from './CoerceoMove';
import { CoerceoState } from './CoerceoState';
import { CoerceoNode } from './CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Player } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class CoerceoMoveGenerator extends MoveGenerator<CoerceoMove, CoerceoState> {

    public getListMoves(node: CoerceoNode): CoerceoMove[] {
        let moves: CoerceoMove[] = this.getListExchanges(node);
        moves = moves.concat(this.getListMovement(node));
        return moves;
    }
    public getListExchanges(node: CoerceoNode): CoerceoMove[] {
        const exchanges: CoerceoMove[] = [];
        const state: CoerceoState = node.gameState;
        const PLAYER: number = state.getCurrentPlayer().value;
        const OPPONENT: FourStatePiece = FourStatePiece.ofPlayer(state.getCurrentOpponent());
        if (state.tiles[PLAYER] < 2) {
            return exchanges;
        }
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content === OPPONENT) {
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
