import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Table } from 'src/app/jscaip/TableUtils';

export class SquarzState extends GameStateWithTable<PlayerOrNone> {

    public static of: (oldState: SquarzState, newBoard: Table<PlayerOrNone>) => SquarzState =
        (oldState: SquarzState, newBoard: Table<PlayerOrNone>) => {
            return new SquarzState(newBoard, oldState.turn);
        };

    public getDominantPlayer(): PlayerOrNone {
        const scores: PlayerNumberMap = this.getScores();
        const scoreZero: number = scores.get(Player.ZERO);
        const scoreOne: number = scores.get(Player.ONE);
        if (scoreZero === scoreOne) {
            return PlayerOrNone.NONE;
        } else if (scoreZero < scoreOne) {
            return PlayerOrNone.ONE;
        } else {
            return PlayerOrNone.ZERO;
        }
    }

    public override setPieceAt(coord: Coord, value: PlayerOrNone): SquarzState {
        return super.setPieceAt(coord, value, SquarzState.of) as SquarzState;
    }

    public getScores(): PlayerNumberMap {
        const scores: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (const coordAndContent of this.getCoordsAndContents()) {
            const piece: PlayerOrNone = coordAndContent.content;
            if (piece.isPlayer()) {
                scores.add(piece, 1);
            }
        }
        return scores;
    }

}
