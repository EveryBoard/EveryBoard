/* eslint-disable max-lines-per-function */
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { ReversiConfig, ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { MGPOptional } from '@everyboard/lib';

describe('ReversiMinimax', () => {

    let rules: ReversiRules;
    let defaultConfig: MGPOptional<ReversiConfig>;
    let minimax: Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        defaultConfig = rules.getDefaultRulesConfig();
        minimax = new ReversiMinimax();
    });

    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(rules.isLegal(bestMove, node.gameState, defaultConfig).isSuccess()).toBeTrue();
    });

});
