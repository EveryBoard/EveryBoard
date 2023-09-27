/* eslint-disable max-lines-per-function */
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { HiveHeuristic } from '../HiveHeuristic';
import { HiveNode } from '../HiveRules';
import { HiveState } from '../HiveState';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { HivePiece } from '../HivePiece';

describe('HiveHeuristic', () => {

    let heuristic: HiveHeuristic;

    const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
    const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
    const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');

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
    it('should prefer when queen bee has a higher mobility', () => {
        // Given a state where the queen bee has more empty spaces around it than another one
        const strongState: HiveState = HiveState.fromRepresentation([
            [[B], [Q]],
            [[G], []],
        ], 4);
        const weakState: HiveState = HiveState.fromRepresentation([
            [[B], [Q], [G]],
        ], 4);
        // When computing their value
        // Then it should prefer having more pieces (i.e., a higher score)
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO);

    });
});
