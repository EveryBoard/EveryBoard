/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { YinshState } from '../YinshState';
import { YinshNode } from '../YinshRules';
import { YinshScoreHeuristic } from '../YinshScoreHeuristic';

describe('YinshScoreHeuristic', () => {

    let heuristic: YinshScoreHeuristic;

    beforeEach(() => {
        heuristic = new YinshScoreHeuristic();
    });
    it('should assign higher values for the player with most rings', () => {
        const state: YinshState = new YinshState(YinshState.getInitialState().board, [2, 1], 20);
        const node: YinshNode = new YinshNode(state);
        expect(heuristic.getBoardValue(node).value * Player.ZERO.getScoreModifier()).toBeGreaterThan(0);
    });
});