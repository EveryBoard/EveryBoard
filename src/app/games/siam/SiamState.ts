import { Player } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { GameStateWithTable } from '@everyboard/games';

import { SiamPiece } from './SiamPiece';

export class SiamState extends GameStateWithTable<SiamPiece> {

    public countCurrentPlayerPawn(): number {
        const currentPlayer: Player = this.getCurrentPlayer();
        return this.countPlayersPawn().get(currentPlayer);
    }

    public countPlayersPawn(): PlayerNumberMap {
        const counts: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content.getOwner().isPlayer()) {
                counts.add(coordAndContent.content.getOwner() as Player, 1);
            }
        }
        return counts;
    }
}
