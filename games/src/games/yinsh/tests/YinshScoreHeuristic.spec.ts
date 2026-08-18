/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { Player } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { YinshNode, YinshRules } from '../YinshRules';
import { YinshScoreHeuristic } from '../YinshScoreHeuristic';
import { YinshState } from '../YinshState';

describe('YinshScoreHeuristic', () => {

    let heuristic: YinshScoreHeuristic;
    const defaultConfig: EmptyRulesConfig = YinshRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new YinshScoreHeuristic();
    });

    it('should assign higher values for the player with most rings', () => {
        const state: YinshState =
            new YinshState(YinshRules.get().getInitialState().board, PlayerNumberMap.of(2, 1), 20);
        const node: YinshNode = new YinshNode(state);
        const boardValue: number = heuristic.getBoardValue(node, defaultConfig).metrics[0];
        expect(boardValue * Player.ZERO.getScoreModifier()).toBeGreaterThan(0);
    });

});
