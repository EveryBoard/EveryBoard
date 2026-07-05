/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Orthogonal } from '../../../jscaip/Orthogonal';
import { SiamHeuristic } from '../SiamHeuristic';
import { SiamMove } from '../SiamMove';
import { SiamMoveGenerator } from '../SiamMoveGenerator';
import { SiamPiece } from '../SiamPiece';
import { SiamNode, SiamLegalityInformation, SiamConfig, SiamRules } from '../SiamRules';
import { SiamState } from '../SiamState';

const _: SiamPiece = SiamPiece.EMPTY;
const M: SiamPiece = SiamPiece.MOUNTAIN;
const U: SiamPiece = SiamPiece.LIGHT_UP;
const L: SiamPiece = SiamPiece.LIGHT_LEFT;
const R: SiamPiece = SiamPiece.LIGHT_RIGHT;
const d: SiamPiece = SiamPiece.DARK_DOWN;

describe('Siam distance profile', () => {

    let minimax: Minimax<SiamMove, SiamState, SiamConfig, SiamLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: SiamConfig = SiamRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new Minimax($localize`Distance`,
                              SiamRules.get(),
                              new SiamHeuristic(),
                              new SiamMoveGenerator());
    });

    it('should choose victory immediately', () => {
        const state: SiamState = new SiamState([
            [_, U, _, M, _],
            [_, _, _, U, _],
            [_, M, M, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ], 1);
        const node: SiamNode = new SiamNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, defaultConfig))
            .toEqual(SiamMove.of(3, 1, MGPOptional.of(Orthogonal.UP), Orthogonal.UP));
    });

    it('should consider pushing as the best option', () => {
        const state: SiamState = new SiamState([
            [_, _, _, _, _],
            [_, _, _, M, _],
            [_, M, M, U, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ], 1);
        const node: SiamNode = new SiamNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, defaultConfig))
            .toEqual(SiamMove.of(3, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP));
    });

    it('should consider pushing from outside to be the best option', () => {
        const state: SiamState = new SiamState([
            [_, _, _, d, _],
            [_, _, _, d, _],
            [L, M, M, M, R],
            [_, _, _, U, _],
            [_, _, _, U, _],
        ], 1);
        const node: SiamNode = new SiamNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, defaultConfig))
            .toEqual(SiamMove.of(3, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP));
    });

});
