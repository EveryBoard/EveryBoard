/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

describe('ReversiMinimax', () => {

    let rules: ReversiRules;
    let minimax: Minimax<ReversiMove, ReversiState, ReversiLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        minimax = new Minimax('Minimax', ReversiRules.get(), new ReversiHeuristic(), new ReversiMoveGenerator());
    });
    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode();
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(rules.isLegal(bestMove, ReversiState.getInitialState()).isSuccess()).toBeTrue();
    });
});
