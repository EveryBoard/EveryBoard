import { ObservedPart } from '../User';
import { UserMocks } from '../UserMocks.spec';

export class ObservedPartMocks {

    public static readonly CREATOR_WITHOUT_OPPONENT: ObservedPart = {
        id: 'configRoomId',
        typeGame: 'P4',
        opponent: null,
        role: 'Creator',
    };
    public static readonly CREATOR_WITH_OPPONENT: ObservedPart = {
        id: 'configRoomId',
        opponent: UserMocks.CANDIDATE_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Creator',
    };
    public static readonly CREATOR_GONE_PLAYER: ObservedPart = {
        id: 'configRoomId',
        role: 'Player',
        typeGame: 'P4',
        opponent: UserMocks.OPPONENT_MINIMAL_USER,
    };
    public static readonly CANDIDATE: ObservedPart = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Candidate',
    };
    public static readonly OTHER_CANDIDATE: ObservedPart = {
        id: 'other-config-room-id',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'Candidate',
    };
    public static readonly OBSERVER: ObservedPart = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly OTHER_OBSERVER: ObservedPart = {
        id: 'other-config-room-id',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'Epaminondas',
        role: 'Observer',
    };
    public static readonly CHOSEN_OPPONENT: ObservedPart = {
        id: 'configRoomId',
        opponent: UserMocks.CREATOR_MINIMAL_USER,
        typeGame: 'P4',
        role: 'ChosenOpponent',
    };
}
