import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { Coord } from '../../jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

export class ReversiState extends GameStateWithTable<PlayerOrNone> {

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

    public countScore(): PlayerMap<number> {
        const scores: [number, number] = [0, 0];
        for (const coordAndContent of this.getCoordsAndContents()) {
            const spaceOwner: PlayerOrNone = coordAndContent.content;
            if (spaceOwner.isPlayer()) {
                scores[spaceOwner.getValue()] += 1;
            }
        }
        return PlayerMap.of(scores[0], scores[1]);
    }

}
