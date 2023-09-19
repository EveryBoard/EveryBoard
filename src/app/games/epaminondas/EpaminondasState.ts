import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasConfig } from './EpaminondasRules';

export class EpaminondasState extends GameStateWithTable<PlayerOrNone> {

    public static getInitialState(config: EpaminondasConfig): EpaminondasState {
        console.log('getInitialState', config)
        const _: PlayerOrNone = PlayerOrNone.NONE;
        const O: PlayerOrNone = PlayerOrNone.ZERO;
        const X: PlayerOrNone = PlayerOrNone.ONE;
        const upperBoard: PlayerOrNone[][] = ArrayUtils.createTable(config.width, config.rowOfSoldier, X);
        const middleBoard: PlayerOrNone[][] = ArrayUtils.createTable(config.width, config.emptyHeight, _);
        const lowerBoard: PlayerOrNone[][] = ArrayUtils.createTable(config.width, config.rowOfSoldier, O);
        const board: Table<PlayerOrNone> = upperBoard.concat(middleBoard).concat(lowerBoard);
        return new EpaminondasState(board, 0);
    }
    public count(piece: Player, row: number): number {
        let result: number = 0;
        const width: number = this.board[0].length;
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
