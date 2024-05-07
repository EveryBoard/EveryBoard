import { Coord } from '../../jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { PlayerOrNoneGameStateWithTable } from 'src/app/jscaip/PlayerOrNoneGameStateWithTable';

export class ReversiState extends PlayerOrNoneGameStateWithTable {

    public getNeighboringPawnLike(searchedValue: Player, center: Coord): Coord[] {
        let coord: Coord;
        const result: Coord[] = [];
        for (let ny: number = -1; ny < 2; ny++) {
            for (let nx: number = -1; nx < 2; nx++) {
                coord = new Coord(center.x + nx, center.y + ny);
                if (this.isOnBoard(coord)) {
                    if (this.board[coord.y][coord.x] === searchedValue) {
                        result.push(coord);
                    }
                }
            }
        }
        return result;
    }

    public countScore(): PlayerNumberMap {
        const scores: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        for (const coordAndContent of this.getPlayerCoordsAndContent()) {
            const spaceOwner: Player = coordAndContent.content;
            scores.add(spaceOwner, 1);
        }
        return scores;
    }

}
