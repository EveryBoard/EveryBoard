/* eslint-disable max-lines-per-function */
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { HiveHeuristic } from '../HiveHeuristic';
import { HiveNode } from '../HiveRules';
import { HiveState } from '../HiveState';

describe('HiveHeuristic', () => {

    let heuristic: HiveHeuristic;

    beforeEach(() => {
        heuristic = new HiveHeuristic();
    });
    it('should assign a 0 value if the queen is not on the board', () => {
        // Given a state without the queen
        const state: HiveState = HiveState.getInitialState();
        const node: HiveNode = new HiveNode(state);

        // When computing its value
        const boardValue: BoardValue = heuristic.getBoardValue(node);

        // Then it should be zero
        expect(boardValue.value).toEqual(0);
    });
});
