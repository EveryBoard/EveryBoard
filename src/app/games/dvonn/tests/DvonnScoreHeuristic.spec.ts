/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnNode, DvonnRules } from '../DvonnRules';
import { DvonnScoreHeuristic } from '../DvonnScoreHeuristic';
import { DvonnState } from '../DvonnState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

const _N: DvonnPieceStack = DvonnPieceStack.UNREACHABLE;
const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
const D1: DvonnPieceStack = DvonnPieceStack.SOURCE;
const O1: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
const X2: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);

describe('DvonnScoreHeuristic', () => {

    let heuristic: DvonnScoreHeuristic;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = DvonnRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new DvonnScoreHeuristic();
    });

    it('should compute board value as the score difference', () => {
        // Given a board
        const board: Table<DvonnPieceStack> = [
            [_N, _N, __, __, __, __, __, __, __, __, __],
            [_N, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, X2, D1, O1, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, _N],
            [__, __, __, __, __, __, __, __, __, _N, _N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const node: DvonnNode = new DvonnNode(state);

        // When computing the board value
        const value: number = heuristic.getBoardValue(node, defaultConfig).value[0];

        // Then it should be 2 - 1 = 1
        expect(value).toBe(1);
    });

});
