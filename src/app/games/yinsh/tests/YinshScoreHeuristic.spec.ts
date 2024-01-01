/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { YinshState } from '../YinshState';
import { YinshNode, YinshRules } from '../YinshRules';
import { YinshScoreHeuristic } from '../YinshScoreHeuristic';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('YinshScoreHeuristic', () => {

    let heuristic: YinshScoreHeuristic;
    const defaultConfig: NoConfig = YinshRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new YinshScoreHeuristic();
    });

    it('should assign higher values for the player with most rings', () => {
        const state: YinshState =
            new YinshState(YinshRules.get().getInitialState().board, PlayerNumberMap.of(2, 1), 20);
        const node: YinshNode = new YinshNode(state);
        expect(heuristic.getBoardValue(node, defaultConfig).value * Player.ZERO.getScoreModifier()).toBeGreaterThan(0);
    });

});
