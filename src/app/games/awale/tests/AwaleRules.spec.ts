import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';
import { AwaleLegalityStatus } from '../AwaleLegalityStatus';
import { expectToBeDraw, expectToBeVictoryFor } from 'src/app/jscaip/tests/Rules.spec';
import { Player } from 'src/app/jscaip/Player';
import { AwaleMinimax } from '../AwaleMinimax';

describe('AwaleRules', () => {
    let rules: AwaleRules;
    let minimax: AwaleMinimax;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
        minimax = new AwaleMinimax('AwaleMinimax');
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
    it('should identify victory for player 0', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwalePartSlice = new AwalePartSlice(board, 5, [26, 22]);
        const node: AwaleNode = new AwaleNode(null, null, state);
        expectToBeVictoryFor(rules, node, Player.ZERO, [minimax]);
    });
    it('should identify victory for player 1', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwalePartSlice = new AwalePartSlice(board, 5, [22, 26]);
        const node: AwaleNode = new AwaleNode(null, null, state);
        expectToBeVictoryFor(rules, node, Player.ONE, [minimax]);
    });
    it('should identify draw', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwalePartSlice = new AwalePartSlice(board, 5, [24, 24]);
        const node: AwaleNode = new AwaleNode(null, null, state);
        expectToBeDraw(rules, node, [minimax]);
    });
});
