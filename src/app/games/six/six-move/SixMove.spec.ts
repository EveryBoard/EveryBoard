import { Coord } from 'src/app/jscaip/coord/Coord';
import { SixMove } from './SixMove';

describe('SiamMove', () => {
    it('Should allow dropping', () => {
        const move: SixMove = SixMove.fromDrop(new Coord(0, 0));
        expect(move).toBeTruthy();
    });
    it('Should allow move without mentionned capture', () => {
        const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('Should throw when creating static deplacement', () => {
        const error: string = 'Deplacement cannot be static!';
        expect(() => SixMove.fromDeplacement(new Coord(0, 0), new Coord(0, 0))).toThrowError(error);
    });
    it('Should allow move with mentionned capture', () => {
        const move: SixMove = SixMove.fromCuttingDeplacement(new Coord(0, 0), new Coord(2, 2), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('Should throw when creating deplacement capturing starting coord', () => {
        const error: string = 'Cannot capture starting coord, since it will always be empty after move!';
        expect(() => SixMove.fromCuttingDeplacement(new Coord(0, 0), new Coord(1, 1), new Coord(0, 0)))
            .toThrowError(error);
    });
});
