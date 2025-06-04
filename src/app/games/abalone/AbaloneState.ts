import { FourStatePieceGameStateWithTable } from '../../../app/jscaip/state/FourStatePieceGameStateWithTable';
import { PlayerNumberMap } from '../../../app/jscaip/PlayerMap';
import { PlayerOrNone } from '../../../app/jscaip/Player';

export class AbaloneState extends FourStatePieceGameStateWithTable {

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
