import { Player } from '../../../app/jscaip/Player';
import { PlayerOrNoneGameStateWithTable } from '../../../app/jscaip/state/PlayerOrNoneGameStateWithTable';

export class EpaminondasState extends PlayerOrNoneGameStateWithTable {

    public doesOwnPiece(player: Player): boolean {
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content === player) {
                return true;
            }
        }
        return false;
    }

}
