import { AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';
import { AwaleLegalityStatus } from '../AwaleLegalityStatus';

describe('AwaleRules', () => {
    let rules: AwaleRules;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
    });
    it('should capture', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 1, 1],
        ];
        const expectedBoard: number[][] = [
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1, 0],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [1, 2]);
        const move: AwaleMove = new AwaleMove(5, 0);
        const status: AwaleLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: AwalePartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: AwalePartSlice =
            new AwalePartSlice(expectedBoard, 1, [3, 2]);
        expect(resultingSlice).toEqual(expectedSlice);
    });
});
