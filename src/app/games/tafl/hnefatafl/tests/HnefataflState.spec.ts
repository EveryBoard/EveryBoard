import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflConfig } from '../../TaflConfig';
import { HnefataflState } from '../HnefataflState';
import { HnefataflRules } from '../HnefataflRules';

const config: TaflConfig = HnefataflRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

describe('HnefataflState', () => {
    describe('getInitialState', () => {
        it('should make invader Player.ZERO when invaders start', () => {
            // Given an initial state with a config where invader starts
            const customConfig: TaflConfig = {
                ...config,
                invaderStarts: true,
            };
            const state: HnefataflState = HnefataflState.getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ZERO
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ZERO);
        });
        it('should make invader Player.ONE when invaders start is false', () => {
            // Given an initial state with a config where invader does not starts
            const customConfig: TaflConfig = {
                ...config,
                invaderStarts: false,
            };
            const state: HnefataflState = HnefataflState.getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ONE
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ONE);
        });
    });
});
