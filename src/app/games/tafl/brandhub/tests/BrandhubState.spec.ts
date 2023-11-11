import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflConfig } from '../../TaflConfig';
import { BrandhubState } from '../BrandhubState';
import { BrandhubRules } from '../BrandhubRules';

const defaultConfig: TaflConfig = BrandhubRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

describe('BrandhubState', () => {
    describe('getInitialState', () => {
        it('should make invader Player.ZERO when invaders start', () => {
            // Given an initial state with a config where invader starts
            const customConfig: TaflConfig = {
                ...defaultConfig,
                invaderStarts: true,
            };
            const state: BrandhubState = BrandhubState.getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ZERO
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ZERO);
        });
        it('should make invader Player.ONE when invaders start is false', () => {
            // Given an initial state with a config where invader does not starts
            const customConfig: TaflConfig = {
                ...defaultConfig,
                invaderStarts: false,
            };
            const state: BrandhubState = BrandhubState.getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ONE
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ONE);
        });
    });
});
