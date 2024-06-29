import { CurrentGame } from '../User';
import { UserMocks } from '../UserMocks.spec';

export class CurrentGameMocks {

    public static readonly CREATOR_WITHOUT_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        typeGame: 'P4',
        opponent: null,
        role: 'Creator',
    };
    public static readonly CREATOR_WITH_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        opponent: UserMocks.CANDIDATE_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Creator',
    };
    public static readonly CREATOR_GONE_PLAYER: CurrentGame = {
        id: 'configRoomId',
        role: 'Player',
        typeGame: 'P4',
        opponent: UserMocks.OPPONENT_MINIMAL_USER,
    };
    public static readonly CANDIDATE: CurrentGame = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Candidate',
    };
    public static readonly OTHER_CANDIDATE: CurrentGame = {
        id: 'other-config-room-id',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Candidate',
    };
    public static readonly OBSERVER: CurrentGame = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly OTHER_OBSERVER: CurrentGame = {
        id: 'other-config-room-id',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly CHOSEN_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'ChosenOpponent',
    };
}
