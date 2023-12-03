import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';

export class EpaminondasState extends GameStateWithTable<PlayerOrNone> {

    public count(piece: Player, row: number): number {
        let result: number = 0;
        const width: number = this.getWidth();
        for (let x: number = 0; x < width; x++) {
            if (this.board[row][x] === piece) {
                result++;
            }
        }
        return result;
    }

    public doesOwnPiece(player: Player): boolean {
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content === player) {
                return true;
            }
        }
        return false;
    }
}
