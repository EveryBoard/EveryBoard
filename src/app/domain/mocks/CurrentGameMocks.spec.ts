import { CurrentGame } from '../User';
import { UserMocks } from '../UserMocks.spec';

export class CurrentGameMocks {

    public static readonly CREATOR_WITHOUT_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        gameName: 'P4',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: null,
        role: 'Creator',
    };
    public static readonly CREATOR_WITH_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: UserMocks.CANDIDATE_MINIMAL_USER,
        gameName: 'P4',
        role: 'Creator',
    };
    public static readonly CREATOR_GONE_PLAYER: CurrentGame = {
        id: 'configRoomId',
        role: 'Player',
        gameName: 'P4',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: UserMocks.OPPONENT_MINIMAL_USER,
    };
    public static readonly CANDIDATE: CurrentGame = {
        id: 'configRoomId',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: null,
        gameName: 'P4',
        role: 'Candidate',
    };
    public static readonly OTHER_CANDIDATE: CurrentGame = {
        id: 'other-config-room-id',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: null,
        gameName: 'P4',
        role: 'Candidate',
    };
    public static readonly OBSERVER: CurrentGame = {
        id: 'configRoomId',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: UserMocks.CANDIDATE_MINIMAL_USER,
        gameName: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly OTHER_OBSERVER: CurrentGame = {
        id: 'other-config-room-id',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: UserMocks.CANDIDATE_MINIMAL_USER,
        gameName: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly CHOSEN_OPPONENT: CurrentGame = {
        id: 'configRoomId',
        creator: UserMocks.CREATOR_MINIMAL_USER,
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        gameName: 'P4',
        role: 'ChosenOpponent',
    };
}
