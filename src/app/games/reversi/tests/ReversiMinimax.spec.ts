/* eslint-disable max-lines-per-function */
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { ReversiMinimax } from '../ReversiMinimax';

describe('ReversiMinimax', () => {

    let rules: ReversiRules;
    let minimax: Minimax<ReversiMove, ReversiState, ReversiLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        minimax = new ReversiMinimax();
    });
    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode();
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(rules.isLegal(bestMove, ReversiRules.get().getInitialState()).isSuccess()).toBeTrue();
    });
});
