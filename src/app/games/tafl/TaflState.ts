import { Coord } from '../../jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';


export abstract class TaflState extends GameStateWithTable<TaflPawn> {

    public abstract from(board: Table<TaflPawn>, turn: number): this;

    public isCentralThrone(coord: Coord): boolean {
        const center: number = (this.board.length - 1) / 2;
        return coord.equals(new Coord(center, center));
    }
    public getRelativeOwner(player: Player, coord: Coord): RelativePlayer {
        const owner: Player = this.getAbsoluteOwner(coord);
        let relativeOwner: RelativePlayer;
        if (owner === Player.NONE) {
            relativeOwner = RelativePlayer.NONE;
        } else if (player === owner) {
            relativeOwner = RelativePlayer.PLAYER;
        } else {
            relativeOwner = RelativePlayer.OPPONENT;
        }
        return relativeOwner;
    }
    public getAbsoluteOwner(coord: Coord): Player {
        const pawn: TaflPawn = this.getPieceAt(coord);
        return pawn.getOwner();
    }
}
