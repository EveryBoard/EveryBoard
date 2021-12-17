import { SaharaRules } from '../SaharaRules';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaMove } from '../SaharaMove';
import { SaharaState } from '../SaharaState';
import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { SaharaFailure } from '../SaharaFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('SaharaMoves', () => {

    it('SaharaMoves should be created bidirectionnaly encodable/decodable', () => {
        const rules: SaharaRules = new SaharaRules(SaharaState);
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
        expect(() => SaharaMove.from(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when move end outside the board', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(-1, 0);
        const expectedError: string = 'Move must end inside the board not at '+ end.toString() + '.';
        expect(() => SaharaMove.from(start, end)).toThrowError(expectedError);
    });
    it('Should throw error when start and end are too far away', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(0, 3);
        const error: string = 'You can move one or two spaces, not 3.';
        const failure: MGPFallible<SaharaMove> = MGPFallible.failure(error);
        expect(SaharaMove.from(start, end)).toEqual(failure);
    });
    it('Should throw error when distance is 1 but start and end arent neighbors', () => {
        const start: Coord = new Coord(0, 1);
        const end: Coord = new Coord(0, 2);
        const expectedError: string = SaharaFailure.THOSE_TWO_SPACES_ARE_NOT_NEIGHBORS();
        const failure: MGPFallible<SaharaMove> = MGPFallible.failure(expectedError);
        expect(SaharaMove.from(start, end)).toEqual(failure);
    });
    it('Should fail when trying to bounce on white triangle', () => {
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(2, 0);
        const error: string = SaharaFailure.CAN_ONLY_REBOUND_ON_BLACK();
        const failure: MGPFallible<SaharaMove> = MGPFallible.failure(error);
        expect(SaharaMove.from(start, end)).toEqual(failure);
    });
    it('Should fail when distance is 2 but common neighbors is the fake neighbors', () => {
        const start: Coord = new Coord(1, 0);
        const end: Coord = new Coord(1, 2);
        const expectedError: string = SaharaFailure.THOSE_TWO_SPACES_HAVE_NO_COMMON_NEIGHBOR();
        const failure: MGPFallible<SaharaMove> = MGPFallible.failure(expectedError);
        expect(SaharaMove.from(start, end)).toEqual(failure);
    });
    it('Should throw when called with static move', () => {
        const error: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        const failure: MGPFallible<SaharaMove> = MGPFallible.failure(error);
        expect(SaharaMove.from(new Coord(0, 0), new Coord(0, 0))).toEqual(failure);
    });
    it('should be equal to itself', () => {
        const move: SaharaMove = SaharaMove.from(new Coord(0, 0), new Coord(1, 0)).get();
        expect(move.equals(move)).toBeTrue();
    });
});
