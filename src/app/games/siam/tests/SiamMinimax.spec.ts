/* eslint-disable max-lines-per-function */
import { SiamNode, SiamLegalityInformation, SiamConfig, SiamRules } from '../SiamRules';
import { SiamPiece } from '../SiamPiece';
import { SiamState } from '../SiamState';
import { SiamMove } from '../SiamMove';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { MGPOptional } from '@everyboard/lib';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { SiamMinimax } from '../SiamMinimax';
import { Table } from 'src/app/jscaip/TableUtils';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';

const _: SiamPiece = SiamPiece.EMPTY;
const M: SiamPiece = SiamPiece.MOUNTAIN;
const U: SiamPiece = SiamPiece.LIGHT_UP;
const L: SiamPiece = SiamPiece.LIGHT_LEFT;
const R: SiamPiece = SiamPiece.LIGHT_RIGHT;
const d: SiamPiece = SiamPiece.DARK_DOWN;

describe('SiamMinimax', () => {

    let minimax: Minimax<SiamMove, SiamState, SiamConfig, SiamLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<SiamConfig> = SiamRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new SiamMinimax();
    });

    describe('best choices', () => {

        it('should choose victory immediately', () => {
            // Given a board where victory can be achieved
            const board: Table<SiamPiece> = [
                [_, U, _, M, _],
                [_, _, _, U, _],
                [_, M, M, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 1);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
            // Then it should go for victory
            const bestMove: SiamMove = SiamMove.of(3, 1, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
        });

        it('should consider pushing as the best option', () => {
            // Given a board where it is possible to push
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, M, M, U, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 1);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
            // Then it should push
            const bestMove: SiamMove = SiamMove.of(3, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
        });

        it('should consider pushing from outside to be the best option', () => {
            // Given a specific board
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [L, M, M, M, R],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 1);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
            // Then the best move should push from outside
            const bestMove: SiamMove = SiamMove.of(3, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
        });

    });

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules: SiamRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
