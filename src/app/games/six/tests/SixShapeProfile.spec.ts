/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { SixFilteredMoveGenerator } from '../SixFilteredMoveGenerator';
import { SixHeuristic } from '../SixHeuristic';
import { SixMove } from '../SixMove';
import { SixConfig, SixLegalityInformation, SixNode, SixRules } from '../SixRules';
import { SixState } from '../SixState';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;
const _: PlayerOrNone = PlayerOrNone.NONE;

describe('Six shape profile', () => {

    let minimax: Minimax<SixMove, SixState, SixConfig, SixLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: SixConfig = SixRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new Minimax($localize`Shape`,
                              SixRules.get(),
                              new SixHeuristic(),
                              new SixFilteredMoveGenerator(SixRules.get()));
    });

    it('should not consider moving pieces that are blocking an opponent victory', () => {
        const state: SixState = SixState.ofRepresentation([
            [O, O, _, _, _, _, O],
            [X, _, _, _, _, X, _],
            [X, _, _, O, X, X, _],
            [X, X, O, X, X, O, _],
            [X, _, X, X, O, _, _],
            [_, X, _, _, _, _, _],
        ], 40);
        const node: SixNode = new SixNode(state);

        expect(minimax.chooseNextMove(node, minimaxOptions, defaultConfig).start.get()).toEqual(new Coord(1, 0));
    });

});
