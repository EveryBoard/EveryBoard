import { PentagoMove } from '../PentagoMove';

describe('PentagoMove', () => {

    it('should throw when rotating inexistant block', () => {
        const expectedError: string = 'This block do not exist: -1';
        expect(() => PentagoMove.withRotation(0, 0, -1, true)).toThrowError(expectedError);
    });
    it('should throw when case not in range', () => {
        const expectedError: string = 'The board is a 6 cas wide square, invalid coord: (-1, 6)';
        expect(() => PentagoMove.rotationless(-1, 6)).toThrowError(expectedError);
    });
    it('should print nicely', () => {
        let expectedString: string = 'PentagoMove(4, 2)';
        let move: PentagoMove = PentagoMove.rotationless(4, 2);
        expect(move.toString()).toEqual(expectedString);

        expectedString = 'PentagoMove((4, 2), 1, CLOCKWISE)';
        move = PentagoMove.withRotation(4, 2, 1, true);
        expect(move.toString()).toEqual(expectedString);

        expectedString = 'PentagoMove((4, 2), 1, ANTI-CLOCKWISE)';
        move = PentagoMove.withRotation(4, 2, 1, false);
        expect(move.toString()).toEqual(expectedString);
    });
    it('should implements equals correctly', () => {
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        const firstDiff: PentagoMove = PentagoMove.withRotation(1, 1, 0, false);
        const secondDiff: PentagoMove = PentagoMove.withRotation(0, 0, 1, false);
        const thirdDiff: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        const noDiff: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        expect(move.equals(firstDiff)).toBeFalse();
        expect(move.equals(secondDiff)).toBeFalse();
        expect(move.equals(thirdDiff)).toBeFalse();
        expect(move.equals(noDiff)).toBeTrue();
    });
});
