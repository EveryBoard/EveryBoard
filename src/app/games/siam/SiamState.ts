import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { SiamPiece } from './SiamPiece';
import { Coord } from 'src/app/jscaip/Coord';

export class SiamState extends GameStateWithTable<SiamPiece> {

    public static readonly SIZE: number = 5;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(SiamState.SIZE, SiamState.SIZE);
    }

    public countCurrentPlayerPawn(): number {
        return this.countPlayersPawn()[this.getCurrentPlayer().value];
    }

    public countPlayersPawn(): [number, number] {
        const counts: [number, number] = [0, 0];
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content !== SiamPiece.EMPTY) {
                counts[coordAndContent.content.getOwner().value]++;
            }
        }
        return counts;
    }
}
