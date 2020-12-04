import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { SaharaRules } from '../sahararules/SaharaRules';
import { SaharaMove } from './SaharaMove';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';

describe('SaharaMoves', () => {

    it('SaharaMoves should be created bidirectionnaly encodable/decodable', () => {
        const rules: SaharaRules = new SaharaRules(SaharaPartSlice);
        expect(rules).toBeTruthy();
        const moves: MGPMap<SaharaMove, SaharaPartSlice> = rules.getListMoves(rules.node);
        expect(moves.size()).toEqual(12);
        for (let i=0; i<moves.size(); i++) {
            const initialMove: SaharaMove = moves.getByIndex(i).key;
            const encodedMove: number = initialMove.encode();
            const decodedMove: SaharaMove = SaharaMove.decode(encodedMove);
            expect(decodedMove).toEqual(initialMove, initialMove.toString() + " should be correctly translated");
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: SaharaMove = new SaharaMove(new Coord(1, 1), new Coord(2, 1));
        spyOn(SaharaMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(SaharaMove.decode).toHaveBeenCalledTimes(1);
    });
    it('Should throw error when starting coord is outside the board', () => {
        const start: Coord = new Coord(-1, 0);
        const end: Coord = new Coord(0, 0);
        const expectedError: string = "Move must start inside the board not at "+ start.toString();
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when move end outside the board', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(-1, 0);
        const expectedError: string = "Move must end inside the board not at "+ end.toString();
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when start and end are too far away', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(0, 3);
        const expectedError: string = "Maximal |x| + |y| distance for SaharaMove is 2, got 3";
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when distance is 1 but start and end arent neighboors', () => {
        const start: Coord = new Coord(0, 1);
        const end: Coord = new Coord(0, 2);
        const expectedError: string = start.toString() + " and " + end.toString() + " are not neighboors";
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when trying to bounce on white triangle', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(2, 0);
        const expectedError: string = "Can only bounce twice when started on a white triangle";
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when distance is 2 but common neighboors is the fake neighboors', () => {
        const start: Coord = new Coord(1, 0);
        const end: Coord = new Coord(1, 2);
        const expectedError: string = start.toString() + " and " + end.toString() + " have no intermediary neighboors";
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
});