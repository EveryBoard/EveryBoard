/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { YinshState } from '../YinshState';
import { YinshNode, YinshRules } from '../YinshRules';
import { YinshScoreHeuristic } from '../YinshScoreHeuristic';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('YinshScoreHeuristic', () => {

    let heuristic: YinshScoreHeuristic;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = YinshRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new YinshScoreHeuristic();
    });

    it('should assign higher values for the player with most rings', () => {
        const state: YinshState = new YinshState(YinshRules.get().getInitialState().board, [2, 1], 20);
        const node: YinshNode = new YinshNode(state);
        const boardValue: number = heuristic.getBoardValue(node, defaultConfig).value[0];
        expect(boardValue * Player.ZERO.getScoreModifier()).toBeGreaterThan(0);
    });

});
