import { AuthUser } from '../services/ConnectedUserService';
import { MGPOptional } from '../utils/MGPOptional';
import { MinimalUser } from './Joiner';
import { User } from './User';

export class UserMocks {

    public static readonly CREATOR_AUTH_USER: AuthUser = new AuthUser('creator-user-doc-id',
                                                                      MGPOptional.of('cre@tor'),
                                                                      MGPOptional.of('creator'),
                                                                      true);
    public static readonly CONNECTED_AUTH_USER: AuthUser = new AuthUser('connected-person-id',
                                                                        MGPOptional.of('connect@aid'),
                                                                        MGPOptional.of('j_connais_qu_Ted'),
                                                                        true);
    public static readonly CREATOR: User = {
        username: UserMocks.CREATOR_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly CONNECTED: User = {
        username: UserMocks.CONNECTED_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly CREATOR_MINIMAL_USER: MinimalUser = UserMocks.CREATOR_AUTH_USER.toMinimalUser();

    public static readonly OPPONENT_AUTH_USER: AuthUser = new AuthUser('firstCandidateUserDocId',
                                                                       MGPOptional.of('opp@nante'),
                                                                       MGPOptional.of('firstCandidate'),
                                                                       true);
    public static readonly CANDIDATE_AUTH_USER: AuthUser = new AuthUser('candidateDocId',
                                                                        MGPOptional.of('candi@ate'),
                                                                        MGPOptional.of('Candid_Hate'),
                                                                        true);
    public static readonly OPPONENT: User = {
        username: UserMocks.OPPONENT_AUTH_USER.username.get(),
        state: 'online',
        verified: true,
    };
    public static readonly OPPONENT_MINIMAL_USER: MinimalUser = UserMocks.OPPONENT_AUTH_USER.toMinimalUser();
    public static readonly CANDIDATE_MINIMAL_USER: MinimalUser = UserMocks.CANDIDATE_AUTH_USER.toMinimalUser();
}
