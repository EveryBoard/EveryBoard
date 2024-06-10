import { GameStateWithTable } from './GameStateWithTable';
import { Player, PlayerOrNone } from '../Player';
import { Coord } from '../Coord';
import { FourStatePiece } from '../FourStatePiece';

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
}

export class FourStatePieceGameStateWithTable extends GameStateWithTable<FourStatePiece> {

    public getPlayerCoordsAndContent(): { coord: Coord, content: Player }[] {
        return this
            .getCoordsAndContents()
            .filter((value: { coord: Coord, content: FourStatePiece}) => {
                return value.content.isPlayer();
            })
            .map((value: { coord: Coord, content: FourStatePiece}) => {
                return {
                    coord: value.coord,
                    content: value.content.getPlayer() as Player,
                };
            });
    }
}
