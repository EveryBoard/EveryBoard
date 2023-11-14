import { Coord } from '../../jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';

export class TaflState extends GameStateWithTable<TaflPawn> {

    public isCentralThrone(coord: Coord): boolean {
        return coord.equals(this.getCentralThrone());
    }

    public getCentralThrone(): Coord {
        const center: number = (this.board.length - 1) / 2;
        return new Coord(center, center);
    }

    public getRelativeOwner(player: Player, coord: Coord): RelativePlayer {
        const owner: PlayerOrNone = this.getAbsoluteOwner(coord);
        let relativeOwner: RelativePlayer;
        if (owner === PlayerOrNone.NONE) {
            relativeOwner = RelativePlayer.NONE;
        } else if (player === owner) {
            relativeOwner = RelativePlayer.PLAYER;
        } else {
            relativeOwner = RelativePlayer.OPPONENT;
        }
        return relativeOwner;
    }

    public getAbsoluteOwner(coord: Coord): PlayerOrNone {
        const pawn: TaflPawn = this.getPieceAt(coord);
        return pawn.getOwner();
    }

    public getSize(): number {
        return this.board.length;
    }

}
