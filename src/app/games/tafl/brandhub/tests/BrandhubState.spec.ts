import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflConfig } from '../../TaflConfig';
import { TaflState } from '../../TaflState';
import { BrandhubRules } from '../BrandhubRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const defaultConfig: MGPOptional<TaflConfig> = BrandhubRules.get().getDefaultRulesConfig();

describe('TaflState', () => {

    describe('getInitialState', () => {

        it('should make invader Player.ZERO when invaders start', () => {
            // Given an initial state with a config where invader starts
            const customConfig: MGPOptional<TaflConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                invaderStarts: true,
            });
            const state: TaflState = BrandhubRules.get().getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ZERO
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ZERO);
        });

        it('should make invader Player.ONE when invaders does not start', () => {
            // Given an initial state with a config where invader does not starts
            const customConfig: MGPOptional<TaflConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                invaderStarts: false,
            });
            const state: TaflState = BrandhubRules.get().getInitialState(customConfig);

            // When checking the invaders coord
            // Then they should be of Player.ONE
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ONE);
        });

    });

});
