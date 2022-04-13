import { LodestoneState } from '../LodestoneState';

describe('LodestoneState', () => {
    describe('initial state', () => {
        it('should initially have 24 pieces for each player', () => {
            // Given the initial state
            const state: LodestoneState = LodestoneState.getInitialState();
            // When computing the number of pieces for each player
            const pieces: [number, number] = state.numberOfPieces();
            // Then we should have 24 for each player
            expect(pieces[0]).toBe(24);
            expect(pieces[1]).toBe(24);
        });
    });
});
