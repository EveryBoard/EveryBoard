import { Player } from 'src/app/jscaip/Player';
import { PlayerOrNoneGameStateWithTable } from 'src/app/jscaip/PlayerOrNoneGameStateWithTable';

export class EpaminondasState extends PlayerOrNoneGameStateWithTable {

    public countRow(player: Player, row: number): number {
        let result: number = 0;
        for (let x: number = 0; x < this.getWidth(); x++) {
            if (this.board[row][x] === player) {
                result++;
            }
        }
        return result;
    }

    public count(player: Player): number {
        let result: number = 0;
        for (const coordAndContent of this.getCoordsAndContents()) {
            if (coordAndContent.content === player) {
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
