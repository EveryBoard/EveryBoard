import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';

export class RectanglzState extends GameStateWithTable<PlayerOrNone> {

    public static mapper: (oldState: RectanglzState, newBoard: Table<PlayerOrNone>) => RectanglzState =
        (oldState: RectanglzState, newBoard: Table<PlayerOrNone>) => {
            return new RectanglzState(newBoard, oldState.turn);
        };

    public isFull(): boolean {
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content.isNone()) {
                return false;
            }
        }
        return true;
    }

    public getDominantPlayer(): PlayerOrNone {
        let scoreZero: number = 0;
        let scoreOne: number = 0;
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content === Player.ZERO) {
                scoreZero++;
            } else if (coordAndContent.content === Player.ONE) {
                scoreOne++;
            }
        }
        if (scoreZero === scoreOne) {
            return PlayerOrNone.NONE;
        } else if (scoreZero < scoreOne) {
            return PlayerOrNone.ONE;
        } else {
            return PlayerOrNone.ZERO;
        }
    }

    public override setPieceAt(coord: Coord, value: PlayerOrNone): RectanglzState {
        return super.setPieceAt(coord, value, RectanglzState.mapper) as RectanglzState;
    }

    public countPieceOf(player: Player): number {
        return this
            .getCoordsAndContents()
            .filter((value: { coord: Coord, content: PlayerOrNone}) => value.content === player)
            .length;
    }

}
