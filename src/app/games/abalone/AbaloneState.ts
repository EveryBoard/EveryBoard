import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { AbaloneRules } from './AbaloneRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';

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
            const piece: FourStatePiece = coordAndContent.content;
            if (piece.isPlayer()) {
                const player: Player = piece.getPlayer() as Player;
                scores.add(player.getOpponent(), -1);
            }
        }
        return scores;
    }
}
