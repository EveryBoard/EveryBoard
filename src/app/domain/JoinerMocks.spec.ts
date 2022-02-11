/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, MinimalUser, PartStatus, PartType } from './Joiner';

const CREATOR: MinimalUser = { id: 'creator-user-doc-id', name: 'creator' };
const FIRST_CANDIDATE: MinimalUser = { id: 'firstCandidate-user-doc-id', name: 'firstCandidate' };
export class JoinerMocks {

    public static readonly INITIAL: Joiner = {
        candidates: [],
        creator: CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
    public static readonly WITH_FIRST_CANDIDATE: Joiner = {
        candidates: [FIRST_CANDIDATE],
        creator: CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
    public static readonly WITH_SECOND_CANDIDATE: Joiner = {
        candidates: [
            FIRST_CANDIDATE,
            { id: 'secondCandidate-user-doc-id', name: 'secondCandidate' },
        ],
        creator: CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
    public static readonly WITH_CHOSEN_OPPONENT: Joiner = {
        candidates: [FIRST_CANDIDATE],
        creator: CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        candidates: [FIRST_CANDIDATE],
        creator: CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        candidates: [FIRST_CANDIDATE],
        creator: CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_STARTED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
}
