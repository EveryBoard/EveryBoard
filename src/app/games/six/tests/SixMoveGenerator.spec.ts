/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { SixMove } from '../SixMove';
import { SixMoveGenerator } from '../SixMoveGenerator';
import { SixConfig, SixNode, SixRules } from '../SixRules';
import { SixState } from '../SixState';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;

describe('SixMoveGenerator', () => {

    let moveGenerator: SixMoveGenerator;
    const defaultConfig: SixConfig = SixRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new SixMoveGenerator(SixRules.get());
    });

    it(`should propose all movements`, () => {
        // Given a board where all pieces are blocked
        const board: Table<PlayerOrNone> = [
            [O, X, X, X, X, X, O],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the moves
        const choices: SixMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be all the possibilities
        // 2 starting positions * 15 possible ends
        expect(choices.length).toBe(30);
    });

});
