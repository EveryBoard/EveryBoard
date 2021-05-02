import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';

describe('PylosMove', () => {
    const coord: PylosCoord = new PylosCoord(0, 0, 0);
    const highCoord: PylosCoord = new PylosCoord(0, 0, 2);

    it('Should forbid invalid move creation', () => {
        // From Climb
        expect(() => PylosMove.fromClimb(null, coord, []))
            .toThrowError('PylosMove: Starting Coord can\'t be null  if it\'s when created fromClimb.');
        expect(() => PylosMove.fromClimb(coord, coord, []))
            .toThrowError('PylosMove: When piece move it must move upward.');
        expect(PylosMove.fromClimb(coord, highCoord, [])).toBeDefined();

        // From Drop
        expect(() => PylosMove.fromDrop(null, [])).toThrowError('PylosMove: Landing Coord can\'t be null.');
        expect(PylosMove.fromDrop(coord, [coord])).toBeDefined();
    });
    it('Should check and change captures correctly', () => {
        // Check capture
        expect(() => PylosMove.checkCaptures([null]))
            .toThrowError('PylosMove: first capture cannot be null, use empty list instead.');
        expect(() => PylosMove.checkCaptures([coord, null]))
            .toThrowError('PylosMove: second capture cannot be null, use 1 sized list instead.');
        expect(() => PylosMove.checkCaptures([coord, coord]))
            .toThrowError('PylosMove: should not capture twice same piece.');
        expect(() => PylosMove.checkCaptures([coord, highCoord, coord]))
            .toThrowError('PylosMove: can\'t capture that much piece.');
        expect(() => PylosMove.checkCaptures([coord, highCoord])).not.toThrowError();

        // Change capture
        const move: PylosMove = PylosMove.fromDrop(coord, [coord]);
        const otherMove: PylosMove = PylosMove.fromDrop(coord, [highCoord]);
        expect(PylosMove.changeCapture(move, [highCoord])).toEqual(otherMove);
    });
    it('PylosMove.encode and PylosMove.decode should be reversible', () => {
        const initialMoves: PylosMove[] = [
            PylosMove.fromClimb(coord, highCoord, []),
            PylosMove.fromClimb(coord, highCoord, [coord]),
            PylosMove.fromClimb(coord, highCoord, [coord, highCoord]),
            PylosMove.fromDrop(coord, []),
            PylosMove.fromDrop(coord, [coord]),
            PylosMove.fromDrop(coord, [highCoord]),
        ];
        const encodedMoves: number[] = initialMoves.map((move: PylosMove) => move.encode());
        const decodedMoves: PylosMove[] = encodedMoves.map((value: number) => PylosMove.decode(value));
        expect(initialMoves).toEqual(decodedMoves);
    });
    it('should delegate to static method decode', () => {
        const testMove: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);

        spyOn(PylosMove, 'decode').and.callThrough();
        testMove.decode(testMove.encode());
        expect(PylosMove.decode).toHaveBeenCalledTimes(1);

        spyOn(testMove, 'encode').and.callThrough();
        PylosMove.encode(testMove);
        expect(testMove.encode).toHaveBeenCalledTimes(1);
    });
    it('Should override toString correctly', () => {
        const lightMove: PylosMove = PylosMove.fromDrop(coord, []);
        const heavyMove: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        expect(lightMove.toString()).toEqual('PylosMove(-, (0, 0, 0), -, -)');
        expect(heavyMove.toString()).toEqual('PylosMove((0, 0, 0), (0, 0, 2), (0, 0, 0), (0, 0, 2))');
    });
    it('Should override equals correctly', () => {
        const badCoord: PylosCoord = new PylosCoord(1, 1, 1);
        const move: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        const otherMove1: PylosMove = PylosMove.fromClimb(badCoord, highCoord, [coord, highCoord]);
        const otherMove2: PylosMove = PylosMove.fromClimb(coord, badCoord, [coord, highCoord]);
        const otherMove3: PylosMove = PylosMove.fromClimb(coord, highCoord, [badCoord, highCoord]);
        const otherMove4: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, badCoord]);

        expect(move.equals(move)).toBeTrue();
        expect(move.equals(otherMove1)).toBeFalse();
        expect(move.equals(otherMove2)).toBeFalse();
        expect(move.equals(otherMove3)).toBeFalse();
        expect(move.equals(otherMove4)).toBeFalse();
    });
    it('Should consider captures [a, b] and [b, a] equal', () => {
        const moveAB: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        const moveBA: PylosMove = PylosMove.fromClimb(coord, highCoord, [highCoord, coord]);
        expect(moveAB.equals(moveBA)).toBeTrue();
    });
});
