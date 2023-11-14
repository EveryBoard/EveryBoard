/* eslint-disable max-lines-per-function */
import { P4State } from '../P4State';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { P4OrderedMoveGenerator } from '../P4OrderedMoveGenerator';
import { P4Move } from '../P4Move';

describe('P4OrderedMoveGenerator', () => {

    let moveGenerator: P4OrderedMoveGenerator;
    const defaultConfig: P4Config = P4Rules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        moveGenerator = new P4OrderedMoveGenerator();
    });
    it('should put center first', () => {
        // Given a state that has a possible move on the center column
        const state: P4State = P4Rules.get().getInitialState(defaultConfig);
        const node: P4Node = new P4Node(state);
        // When generating the moves
        const moves: P4Move[] = moveGenerator.getListMoves(node);
        // Then it should have the center as the first move
        expect(moves[0]).toEqual(P4Move.of(3));
    });
});
