/* eslint-disable max-lines-per-function */
import { KalahRules } from '../KalahRules';
import { MancalaState } from '../../common/MancalaState';
import { KalahMoveGenerator } from '../KalahMoveGenerator';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('KalahMoveGenerator', () => {

    let moveGenerator: KalahMoveGenerator;
    const config: MancalaConfig = KalahRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        moveGenerator = new KalahMoveGenerator();
    });

    function getMancalaNode(state: MancalaState, config: MancalaConfig): MancalaNode {
        return new MancalaNode(
            state,
            MGPOptional.empty(),
            MGPOptional.empty(),
            MGPOptional.of(config),
        );
    }
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = KalahRules.get().getInitialState(config);
        const node: MancalaNode = getMancalaNode(initialState, config);

        // When listing the moves
        const moves: MancalaMove[] = moveGenerator.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });

    it('Given a state where possible moves must end in Kalah', () => {
        // Given a state with possible moves
        const state: MancalaState = new MancalaState([
            [5, 2, 3, 2, 1, 2],
            [1, 0, 0, 0, 0, 0],
        ], 24, [13, 20]);
        const node: MancalaNode = getMancalaNode(state, config);

        // When listing the moves
        const moves: MancalaMove[] = moveGenerator.getListMoves(node);

        // Then there should be those moves
        expect(moves.length).toBe(1);
    });

});
