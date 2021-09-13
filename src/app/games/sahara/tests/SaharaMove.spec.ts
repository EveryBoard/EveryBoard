import { SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { SaharaFailure } from '../SaharaFailure';

describe('SaharaMoves', () => {

    it('SaharaMoves should be created bidirectionnaly encodable/decodable', () => {
        const rules: SaharaRules = new SaharaRules(SaharaPartSlice);
        expect(rules).toBeTruthy();
        const minimax: SaharaMinimax = new SaharaMinimax(rules, 'SaharaMinimax');
        const moves: SaharaMove[] = minimax.getListMoves(rules.node);
        expect(moves.length).toEqual(12);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(SaharaMove.encoder, move);
        }
    });
    it('Should throw error when starting coord is outside the board', () => {
        const start: Coord = new Coord(-1, 0);
        const end: Coord = new Coord(0, 0);
        const expectedError: string = 'Move must start inside the board not at '+ start.toString() + '.';
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when move end outside the board', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(-1, 0);
        const expectedError: string = 'Move must end inside the board not at '+ end.toString() + '.';
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when start and end are too far away', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(0, 3);
        const expectedError: string = 'You can move one or two spaces, not 3.';
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when distance is 1 but start and end arent neighboors', () => {
        const start: Coord = new Coord(0, 1);
        const end: Coord = new Coord(0, 2);
        const expectedError: string = start.toString() + ' and ' + end.toString() + ' are not neighboors.';
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when trying to bounce on white triangle', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(2, 0);
        const expectedError: string = SaharaFailure.CAN_ONLY_REBOUND_ON_BLACK;
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when distance is 2 but common neighboors is the fake neighboors', () => {
        const start: Coord = new Coord(1, 0);
        const end: Coord = new Coord(1, 2);
        const expectedError: string = start.toString() + ' and ' + end.toString() + ' have no intermediary neighboors.';
        expect(() => new SaharaMove(start, end)).toThrowError(expectedError);
    });
    it('Should throw when called with static move', () => {
        expect(() => new SaharaMove(new Coord(0, 0), new Coord(0, 0))).toThrowError('MoveCoordToCoord cannot be static.');
    });
    it('should be equal to itself', () => {
        const move: SaharaMove = new SaharaMove(new Coord(0, 0), new Coord(1, 0));
        expect(move.equals(move)).toBeTrue();
    });
});
