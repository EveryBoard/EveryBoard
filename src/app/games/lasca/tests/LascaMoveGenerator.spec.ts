/* eslint-disable max-lines-per-function */
import { LascaMove } from '../LascaMove';
import { LascaMoveGenerator } from '../LascaMoveGenerator';
import { LascaNode, LascaRules } from '../LascaRules';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

const u: LascaStack = new LascaStack([LascaPiece.ZERO]);
const v: LascaStack = new LascaStack([LascaPiece.ONE]);
const _: LascaStack = LascaStack.EMPTY;

describe('LascaControlMoveGenerator', () => {

    let moveGenerator: LascaMoveGenerator;
    const defaultConfig: NoConfig = LascaRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new LascaMoveGenerator();
    });

    it('should return full list of captures when capture must be done', () => {
        // Given a state where current player should capture
        const state: LascaState = LascaState.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, v, _, _, _, _],
            [_, u, _, u, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, u, _],
            [_, _, _, _, _, _, _],
        ], 1);
        const node: LascaNode = new LascaNode(state);

        // When listing the moves
        const moves: LascaMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should return the list of capture
        expect(moves.length).toBe(2);
    });

    it('should return full list of steps when no capture must be done', () => {
        // Given a state where only steps can be made
        const state: LascaState = LascaRules.get().getInitialState();
        const node: LascaNode = new LascaNode(state);

        // When listing the moves
        const moves: LascaMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should return the list of steps
        expect(moves.length).toBe(6);
    });

});
