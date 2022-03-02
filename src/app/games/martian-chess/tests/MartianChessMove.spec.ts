import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MartianChessMove, MartianChessMoveFailure } from '../MartianChessMove';

fdescribe('MartianChessMove', () => {
    it('should be illegal to choose a coord out of the board', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(-1, -1), new Coord(0, 0));
        const expectedResult: string = MartianChessMoveFailure.START_COORD_OUT_OF_RANGE;
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should be illegal to land a move out of the board', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(4, 8));
        const expectedResult: string = MartianChessMoveFailure.END_COORD_OUT_OF_RANGE;
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
    it('should be illegal to make a non linar move', () => {
        const move: MGPFallible<MartianChessMove> = MartianChessMove.from(new Coord(0, 0), new Coord(1, 2));
        const expectedResult: string = 'cafei';
        expect(move.getReasonOr('')).toBe(expectedResult);
    });
});
