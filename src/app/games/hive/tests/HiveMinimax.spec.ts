import { Player } from 'src/app/jscaip/Player';
import { HiveMinimax } from '../HiveMinimax';
import { HiveMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HiveNode, HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';

describe('HiveDummyMinimax', () => {

    let rules: HiveRules;
    let minimax: HiveMinimax;

    beforeEach(() => {
        rules = HiveRules.get();
        minimax = new HiveMinimax(rules, 'HiveDummyMinimax');
    });
    it('should propose 5 moves at first turn', () => {
        // Given the initial state
        const state: HiveState = HiveState.getInitialState();
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = minimax.getListMoves(node);

        // Then there should be 5 moves
        expect(moves.length).toBe(5);
    });
    it('should propose 6x5 moves at second turn', () => {
        // Given any state in the second turn
        const state: HiveState = HiveState.fromRepresentation([
            [[new HivePiece(Player.ZERO, 'QueenBee')]],
        ], 1);
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = minimax.getListMoves(node);

        // Then there should be 6x5 moves: 6 possible drop locations for 5 pieces
        expect(moves.length).toBe(6 * 5);
    });
});
