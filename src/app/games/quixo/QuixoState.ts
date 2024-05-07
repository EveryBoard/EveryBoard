import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoMove } from './QuixoMove';
import { PlayerOrNoneGameStateWithTable } from 'src/app/jscaip/PlayerOrNoneGameStateWithTable';

export type QuixoConfig = {
    width: number,
    height: number,
};

export class QuixoState extends PlayerOrNoneGameStateWithTable {

    public applyLegalMove(move: QuixoMove): QuixoState {
        const newBoard: PlayerOrNone[][] = this.getCopiedBoard();
        const newTurn : number = this.turn + 1;
        let currentCoordToFill: Coord = move.coord;
        let nextCoordToSlide: Coord = move.coord.getNext(move.direction);
        while (this.isOnBoard(nextCoordToSlide)) {
            newBoard[currentCoordToFill.y][currentCoordToFill.x] = newBoard[nextCoordToSlide.y][nextCoordToSlide.x];
            currentCoordToFill = currentCoordToFill.getNext(move.direction);
            nextCoordToSlide = nextCoordToSlide.getNext(move.direction);
        }
        newBoard[currentCoordToFill.y][currentCoordToFill.x] = this.getCurrentPlayer();
        return new QuixoState(newBoard, newTurn);
    }

}
