import { Player } from 'src/app/jscaip/Player';
import { HiveDummyMinimax } from '../HiveDummyMinimax';
import { HiveMove } from '../HiveMove';
import { HivePieceQueenBee } from '../HivePiece';
import { HiveNode, HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';

describe('HiveDummyMinimax', () => {

    let rules: HiveRules;
    let minimax: HiveDummyMinimax;

    beforeEach(() => {
        rules = HiveRules.get();
        minimax = new HiveDummyMinimax(rules, 'HiveDummyMinimax');
    });
    it('should propose 5 moves at first turn', () => {
        // Given the initial state
        const state: HiveState = HiveState.getInitialState();
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = minimax.getListMoves(node);

        // Thne there should be 5 moves
        expect(moves.length).toBe(5);
    });
    it('should propose 6x5 moves at second turn', () => {
        // Given any state in the second turn
        const state: HiveState = HiveState.fromRepresentation([
            [[new HivePieceQueenBee(Player.ZERO)]],
        ], 1);
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = minimax.getListMoves(node);

        // Then there should be 6x5 moves: 6 possible drop locations for 5 pieces
        expect(moves.length).toBe(6 * 5);
    });
});
