import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { RectangularGameState } from 'src/app/jscaip/RectangularGameState';
import { Player } from 'src/app/jscaip/Player';
import { QuixoMove } from './QuixoMove';

export class QuixoState extends RectangularGameState<Player> {

    public static getInitialState(): QuixoState {
        const initialBoard: Player[][] = ArrayUtils.createTable(5, 5, Player.NONE);
        return new QuixoState(initialBoard, 0);
    }
    public applyLegalMove(move: QuixoMove): QuixoState {
        const newBoard: Player[][] = this.getCopiedBoard();
        const newTurn : number = this.turn + 1;
        let currentCoordToFill: Coord = move.coord;
        let nextCoordToSlide: Coord = move.coord.getNext(move.direction);
        while (nextCoordToSlide.isInRange(5, 5)) {
            newBoard[currentCoordToFill.y][currentCoordToFill.x] = newBoard[nextCoordToSlide.y][nextCoordToSlide.x];
            currentCoordToFill = currentCoordToFill.getNext(move.direction);
            nextCoordToSlide = nextCoordToSlide.getNext(move.direction);
        }
        newBoard[currentCoordToFill.y][currentCoordToFill.x] = this.getCurrentPlayer();
        return new QuixoState(newBoard, newTurn);
    }
}
