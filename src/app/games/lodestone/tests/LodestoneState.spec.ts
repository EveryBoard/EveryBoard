import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { LodestoneRules } from '../LodestoneRules';
import { LodestoneState } from '../LodestoneState';

describe('LodestoneState', () => {

    describe('initial state', () => {

        it('should initially have 24 pieces for each player', () => {
            // Given the initial state
            const state: LodestoneState = LodestoneRules.get().getInitialState();
            // When computing the number of pieces for each player
            const pieces: PlayerNumberMap = state.numberOfPieces();
            // Then we should have 24 for each player
            expect(pieces).toEqual(PlayerNumberMap.of(24, 24));
        });

    });

});
