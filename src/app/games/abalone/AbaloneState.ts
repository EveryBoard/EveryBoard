import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { AbaloneRules } from './AbaloneRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class AbaloneState extends GameStateWithTable<FourStatePiece> {

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(9, 9) &&
               AbaloneRules.get().getInitialState().getPieceAt(coord) !== FourStatePiece.UNREACHABLE;
    }

    public isPiece(coord: Coord): boolean {
        const piece: FourStatePiece = this.getPieceAt(coord);
        return piece.isPlayer();
    }

    public getScores(): PlayerNumberMap {
        const scores: PlayerNumberMap = PlayerNumberMap.of(14, 14);
        for (const coordAndContent of this.getCoordsAndContents()) {
            const owner: PlayerOrNone = coordAndContent.content.getPlayer();
            if (owner.isPlayer()) {
                scores.add(owner.getOpponent(), -1);
            }
        }
        return scores;
    }
}
