import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { GameStateWithTable } from '@everyboard/games';
import { PlayerOrNoneGameStateWithTable } from '@everyboard/games';

export class SquarzState extends PlayerOrNoneGameStateWithTable {

    public static of(oldState: SquarzState, newBoard: Table<PlayerOrNone>): SquarzState {
        return new SquarzState(newBoard, oldState.turn);
    }

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

    public setPieceAt(coord: Coord, value: PlayerOrNone): SquarzState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             SquarzState.of);
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

    public hasMovablePieceAt(coord: Coord, jumpSize: number): boolean {
        for (let y: number = -jumpSize; y <= jumpSize; y++) {
            for (let x: number = -jumpSize; x <= jumpSize; x++) {
                const landingCoord: Coord = new Coord(coord.x + x, coord.y + y);
                if (this.isEmptyAt(landingCoord)) {
                    return true;
                }
            }
        }
        return false;
    }

}
