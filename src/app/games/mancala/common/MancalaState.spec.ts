import { MancalaState } from './MancalaState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MancalaRules } from './MancalaRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaConfig } from './MancalaConfig';

describe('MancalaState', () => {

    it('should compare correctly', () => {
        // Given an initial state
        const config: MGPOptional<MancalaConfig> = MGPOptional.of({
            feedOriginalHouse: true,
            mustContinueDistributionAfterStore: true,
            mustFeed: true,
            passByPlayerStore: true,
            seedsByHouse: 4,
            width: 6,
        });
        const state: MancalaState = MancalaRules.getInitialState(config);
        // and state with different board
        const differentBoard: MancalaState = new MancalaState([
            [1, 2, 3, 4, 5, 6],
            [1, 2, 3, 4, 5, 6],
        ], state.turn, state.scores);
        // and a state with different scores
        const differentScore: MancalaState = new MancalaState(state.board, state.turn, PlayerNumberMap.of(28, 52));
        // and a state with a different turn
        const differentTurn: MancalaState = new MancalaState(state.board, state.turn + 1, state.scores);

        // When comparing the three to the original one
        // Then it should all be false, as they are different
        expect(state.equals(differentBoard)).toBeFalse();
        expect(state.equals(differentScore)).toBeFalse();
        expect(state.equals(differentTurn)).toBeFalse();
    });

});
