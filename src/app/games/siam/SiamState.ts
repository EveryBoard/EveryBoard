import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { SiamPiece } from './SiamPiece';

export class SiamState extends GameStateWithTable<SiamPiece> {

    public countCurrentPlayerPawn(): number {
        return this.countPlayersPawn()[this.getCurrentPlayer().getValue()];
    }

    public countPlayersPawn(): [number, number] {
        const counts: [number, number] = [0, 0];
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content !== SiamPiece.EMPTY) {
                counts[coordAndContent.content.getOwner().getValue()]++;
            }
        }
        return counts;
    }
}
