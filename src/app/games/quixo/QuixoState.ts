import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoMove } from './QuixoMove';

export class QuixoState extends GameStateWithTable<PlayerOrNone> {

    public static readonly SIZE: number = 5; // CHECK USE

    public static getInitialState(): QuixoState {
        const initialBoard: PlayerOrNone[][] = ArrayUtils.createTable(QuixoState.SIZE,
                                                                      QuixoState.SIZE,
                                                                      PlayerOrNone.NONE);
        return new QuixoState(initialBoard, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(QuixoState.SIZE, QuixoState.SIZE);
    }
    public applyLegalMove(move: QuixoMove): QuixoState {
        const newBoard: PlayerOrNone[][] = this.getCopiedBoard();
        const newTurn : number = this.turn + 1;
        let currentCoordToFill: Coord = move.coord;
        let nextCoordToSlide: Coord = move.coord.getNext(move.direction);
        while (QuixoState.isOnBoard(nextCoordToSlide)) {
            newBoard[currentCoordToFill.y][currentCoordToFill.x] = newBoard[nextCoordToSlide.y][nextCoordToSlide.x];
            currentCoordToFill = currentCoordToFill.getNext(move.direction);
            nextCoordToSlide = nextCoordToSlide.getNext(move.direction);
        }
        newBoard[currentCoordToFill.y][currentCoordToFill.x] = this.getCurrentPlayer();
        return new QuixoState(newBoard, newTurn);
    }
}
