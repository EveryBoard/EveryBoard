/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { QuartoHeuristic } from '../QuartoHeuristic';
import { QuartoMove } from '../QuartoMove';
import { QuartoMoveGenerator } from '../QuartoMoveGenerator';
import { QuartoPiece } from '../QuartoPiece';
import { QuartoConfig, QuartoNode, QuartoRules } from '../QuartoRules';
import { QuartoState } from '../QuartoState';

const ____: QuartoPiece = QuartoPiece.EMPTY;
const AAAA: QuartoPiece = QuartoPiece.AAAA;
const AAAB: QuartoPiece = QuartoPiece.AAAB;
const AABA: QuartoPiece = QuartoPiece.AABA;
const ABBB: QuartoPiece = QuartoPiece.ABBB;

describe('Quarto alignment profile', () => {

    const rules: QuartoRules = QuartoRules.get();
    const minimax: Minimax<QuartoMove, QuartoState, QuartoConfig> =
        new Minimax($localize`Alignment`, rules, new QuartoHeuristic(), new QuartoMoveGenerator());
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    it('should choose victory of level two when possible', () => {
        const level2v2Config: QuartoConfig = {
            playerZeroLevel: 2,
            playerOneLevel: 2,
        };
        const state: QuartoState = new QuartoState([
            [AAAA, ABBB, ____, ____],
            [AAAB, ____, ____, ____],
            [____, ____, ____, ____],
            [____, ____, ____, ____],
        ], 3, QuartoPiece.ABBB);
        const node: QuartoNode = new QuartoNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, level2v2Config).coord.equals(new Coord(1, 1))).toBeTrue();
    });

    it('should choose victory of level one when it is player zero turn and both victory levels are possible', () => {
        const asymetricConfig: QuartoConfig = {
            playerZeroLevel: 1,
            playerOneLevel: 2,
        };
        const state: QuartoState = new QuartoState([
            [AAAA, ABBB, ____, ____],
            [AAAB, ____, ____, ____],
            [AABA, ____, ____, ____],
            [____, ____, ____, ____],
        ], 4, QuartoPiece.ABBB);
        const node: QuartoNode = new QuartoNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, asymetricConfig).coord.equals(new Coord(0, 3))).toBeTrue();
    });

    it('should choose victory of level one when it is player one turn and both victory levels are possible', () => {
        const asymetricConfig: QuartoConfig = {
            playerZeroLevel: 1,
            playerOneLevel: 2,
        };
        const state: QuartoState = new QuartoState([
            [AAAA, ABBB, ____, ____],
            [AAAB, ____, ____, ____],
            [AABA, ____, ____, ____],
            [____, ____, ____, ____],
        ], 4, QuartoPiece.ABBB);
        const node: QuartoNode = new QuartoNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, asymetricConfig).coord).toEqual(new Coord(0, 3));
    });

});
