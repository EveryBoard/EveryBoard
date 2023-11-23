/* eslint-disable max-lines-per-function */
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiConfig, ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ReversiMinimax } from '../ReversiMinimax';

describe('ReversiMinimax', () => {

    let rules: ReversiRules;
    let defaultConfig: ReversiConfig;
    let minimax: Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        defaultConfig = rules.getRulesConfigDescription().defaultConfig.config;
        minimax = new ReversiMinimax();
    });
    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(rules.isLegal(bestMove, ReversiRules.get().getInitialState(defaultConfig)).isSuccess()).toBeTrue();
    });
});
