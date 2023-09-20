/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PenteAlignmentMinimax } from '../PenteAlignmentMinimax';
import { PenteMove } from '../PenteMove';
import { PenteNode, PenteRules } from '../PenteRules';
import { PenteState } from '../PenteState';
import { gobanConfig } from 'src/app/jscaip/GobanConfig';

describe('PenteAlignmentMinimax', () => {
    let rules: PenteRules;
    let minimax: PenteAlignmentMinimax;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;

    beforeEach(() => {
        rules = PenteRules.get();
        minimax = new PenteAlignmentMinimax(rules, 'PenteAlignmentMinimax');
    });
    it('should propose exactly 360 moves at first turn', () => {
        // Given the initial state
        const node: PenteNode = new PenteNode(PenteState.getInitialState(gobanConfig));
        // When computing all possible moves
        const moves: PenteMove[] = minimax.getListMoves(node);
        // Then it should have one move per empty space, i.e., 19x19 - 1 = 360
        expect(moves.length).toBe(360);
    });
    it('should prefer longer alignments', () => {
        // Given two states, one of which has "better" alignments
        const weakerState: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 6);
        const strongerState: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 6);
        // When using the minimax
        // Then it should consider the better aligned state stronger
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakerState, MGPOptional.empty(),
                                                           strongerState, MGPOptional.empty(),
                                                           Player.ZERO);
    });
});
