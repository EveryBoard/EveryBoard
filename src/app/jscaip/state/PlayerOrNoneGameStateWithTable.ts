import { Coord } from '../Coord';
import { Player, PlayerOrNone } from '../Player';

import { GameStateWithTable } from './GameStateWithTable';

export class PlayerOrNoneGameStateWithTable extends GameStateWithTable<PlayerOrNone> {

    public getPlayerCoordsAndContent(): { coord: Coord, content: Player }[] {
        return this
            .getCoordsAndContents()
            .filter((value: { coord: Coord, content: PlayerOrNone}) => {
                return value.content.isPlayer();
            })
            .map((value: { coord: Coord, content: PlayerOrNone}) => {
                return {
                    coord: value.coord,
                    content: value.content as Player,
                };
            });
    }

    public isEmptyAt(coord: Coord): boolean {
        return this.hasPieceAt(coord, PlayerOrNone.NONE);
    }

}
