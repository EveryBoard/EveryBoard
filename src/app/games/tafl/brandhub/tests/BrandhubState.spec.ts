import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflConfig } from '../../TaflConfig';
import { BrandhubState } from '../BrandhubState';

describe('BrandhubState', () => {
    describe('getInitialState', () => {
        it('should make invader Player.ZERO when invaders start', () => {
            // Given an initial state with a config where invader starts
            const rulesConfig: TaflConfig = {
                borderCanSurroundKing: true, // Not revelant here
                castleIsLeftForGood: true, // Not revelant here
                centralThroneCanSurroundKing: true, // Not revelant here
                kingFarFromHomeCanBeSandwiched: true, // Not revelant here
                invaderStarts: true,
            };
            const state: BrandhubState = BrandhubState.getInitialState(rulesConfig);

            // When checking the invaders coord
            // Then they should be of Player.ZERO
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ZERO);
        });
        it('should make invader Player.ONE when invaders start is false', () => {
            // Given an initial state with a config where invader does not starts
            const rulesConfig: TaflConfig = {
                borderCanSurroundKing: true, // Not revelant here
                castleIsLeftForGood: true, // Not revelant here
                centralThroneCanSurroundKing: true, // Not revelant here
                kingFarFromHomeCanBeSandwiched: true, // Not revelant here
                invaderStarts: false,
            };
            const state: BrandhubState = BrandhubState.getInitialState(rulesConfig);

            // When checking the invaders coord
            // Then they should be of Player.ONE
            const invader: PlayerOrNone = state.getPieceAtXY(3, 0).getOwner();
            expect(invader).toBe(PlayerOrNone.ONE);
        });
    });
});
