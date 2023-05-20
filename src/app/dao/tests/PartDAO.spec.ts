/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedUser, createUnverifiedUser, signOut, reconnectUser, createDisconnectedUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectPermissionToBeDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { PartDAO } from '../PartDAO';
import { UserDAO } from '../UserDAO';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConfigRoomDAO } from '../ConfigRoomDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConfigRoom, PartStatus } from 'src/app/domain/ConfigRoom';
import { FocusedPart } from 'src/app/domain/User';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { GameEventService } from '../../services/GameEventService';
import { PartEvent, RequestType } from '../../domain/Part';
import { IFirestoreDAO } from '../FirestoreDAO';

type PartInfo = {
    id: string,
    part: Part,
    creator: MinimalUser,
    candidate: MinimalUser,
}

describe('PartDAO security', () => {

    let partDAO: PartDAO;
    let gameEventService: GameEventService;
    let userDAO: UserDAO;
    let configRoomDAO: ConfigRoomDAO;
    let configRoomService: ConfigRoomService;

    const CREATOR_EMAIL: string = UserMocks.CREATOR_AUTH_USER.email.get();
    const CREATOR_NAME: string = UserMocks.CREATOR_AUTH_USER.username.get();

    const CANDIDATE_EMAIL: string = UserMocks.CANDIDATE_AUTH_USER.email.get();
    const CANDIDATE_NAME: string = UserMocks.CANDIDATE_AUTH_USER.username.get();

    const OPPONENT_EMAIL: string = UserMocks.OPPONENT_AUTH_USER.email.get();
    const OPPONENT_NAME: string = UserMocks.OPPONENT_AUTH_USER.username.get();

    const MALICIOUS_EMAIL: string = 'm@licio.us';
    const MALICIOUS_NAME: string = 'malicious';

    async function addCandidate(partId: string, signOutUser: boolean = true): Promise<MinimalUser> {
        const candidate: MinimalUser = await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
        await configRoomService.addCandidate(partId, candidate);
        if (signOutUser) {
            await signOut();
        }
        return candidate;
    }
    async function preparePart(): Promise<PartInfo> {
        // Given a part, an accepted config, and a user who is the chosen opponent in the configRoom
        // Creator creates the configRoom
        const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
        const part: Part = { ...PartMocks.INITIAL, playerZero: creator };
        const partId: string = await partDAO.create(part);
        await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });
        await signOut();

        // A candidate adds themself to the candidates list
        const candidate: MinimalUser = await addCandidate(partId);

        // The creator then selects candidates as the chosen opponent and proposes the config
        await reconnectUser(CREATOR_EMAIL);
        const update: Partial<ConfigRoom> = {
            chosenOpponent: candidate,
            partStatus: PartStatus.CONFIG_PROPOSED.value,
        };
        await expectAsync(configRoomDAO.update(partId, update)).toBeResolvedTo();
        await signOut();

        // And the candidate accepts the config
        await reconnectUser(CANDIDATE_EMAIL);
        await configRoomDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

        return { id: partId, part, creator, candidate };
    }
    async function setupStartedPartAsPlayerZero(): Promise<string> {
        const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
        const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

        const part: Part = { ...PartMocks.STARTED, playerZero, playerOne, turn: 0 };
        const partId: string = await partDAO.create(part);
        return partId;
    }
    async function setupFinishedPartAsPlayerZero(): Promise<string> {
        const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
        const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
        const part: Part = { ...PartMocks.STARTED, playerZero, playerOne, turn: 0 };
        const partId: string = await partDAO.create(part);
        await expectAsync(partDAO.update(partId, {
            turn: 1,
            result: MGPResult.VICTORY.value,
            winner: playerZero,
            loser: playerOne,
        })).toBeResolved();
        return partId;
    }
    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
        gameEventService = TestBed.inject(GameEventService);
        userDAO = TestBed.inject(UserDAO);
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        configRoomService = TestBed.inject(ConfigRoomService);
    });
    function events(partId: string): IFirestoreDAO<PartEvent> {
        return partDAO.subCollectionDAO<PartEvent>(partId, 'events');
    }
    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });
    describe('for verified user', () => {
        it('should allow creating a part', async() => {
            // Given a verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            // When creating a part
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
        it('should forbid creating a part with the wrong playerZero', async() => {
            // Given a verified user, and a verified creator
            const otherUser: MinimalUser = await createDisconnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When creating a part with another user as playerZero
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: otherUser });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid creating a part with the winner already set', async() => {
            // Given a creator
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            // When creating a part where the winner is already set
            const result: Promise<string> = partDAO.create({
                ...PartMocks.INITIAL,
                playerZero: creator,
                winner: creator,
            });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid creating a part with the loser already set', async() => {
            // Given a creator
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            // When creating a part where the loser is already set
            const result: Promise<string> = partDAO.create({
                ...PartMocks.INITIAL,
                playerZero: creator,
                loser: creator,
            });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid creating a part with the winner and loser already set', async() => {
            // Given a creator
            const otherUser: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            // When creating a part where the loser is already set
            const result: Promise<string> = partDAO.create({
                ...PartMocks.INITIAL,
                playerZero: creator,
                loser: creator,
                winner: otherUser,
            });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow reading parts', async() => {
            // Given a part and a verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const part: Part = { ...PartMocks.INITIAL, playerZero: creator };
            const partId: string = await partDAO.create(part);
            await signOut();

            await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            // When reading the part
            const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo(MGPOptional.of(part));
        });
        it('should forbid non-player to change fields', async() => {
            // Given a part, and a user who is not playing in this game
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            await signOut();
            const user: MinimalUser = await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            const updates: Partial<Part>[] = [
                { typeGame: 'Quarto' },
                { playerZero: user },
                { playerOne: user },
                { beginning: serverTimestamp() },
                { turn: 42 },
                { result: 3 },
                { winner: creator },
                { loser: user },
                { scorePlayerZero: 42 },
                { scorePlayerOne: 42 },
            ];
            for (const update of updates) {
                // When trying to change the field
                const result: Promise<void> = partDAO.update(partId, update);
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
        it('should forbid deleting non-started part if creator has not timed out', async() => {
            // Given a non-started part and its creator that has not timed out
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            const observedPart: FocusedPart = {
                ...FocusedPartMocks.CREATOR_WITHOUT_OPPONENT,
                id: partId,
            };
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });
            const lastUpdateTime: Timestamp = new Timestamp(Math.floor(Date.now() / 1000), 0);
            await userDAO.update(creator.id, { observedPart, lastUpdateTime });
            await signOut();

            // and given another user
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the other user deletes the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow deleting non-started part if creator has timed out', async() => {
            // Given a non-started part with its creator who has timed out
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            const observedPart: FocusedPart = {
                ...FocusedPartMocks.CREATOR_WITHOUT_OPPONENT,
                id: partId,
            };
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });
            const lastUpdateTime: Timestamp = new Timestamp(0, 0); // creator is stuck in 1970
            await userDAO.update(creator.id, { observedPart, lastUpdateTime });
            await signOut();

            // and given another user
            await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

            // When the other user deletes the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid deleting a started part (creator has not timed out)', async() => {
            // Given a started part and its creator that has not timed out
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero: creator });
            const observedPart: FocusedPart = {
                ...FocusedPartMocks.CREATOR_WITHOUT_OPPONENT,
                id: partId,
            };
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });
            const lastUpdateTime: Timestamp = new Timestamp(Math.floor(Date.now() / 1000), 0);
            await userDAO.update(creator.id, { observedPart, lastUpdateTime });
            await signOut();

            // and given another user
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the other user deletes the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid deleting a started part (creator has timed out)', async() => {
            // Given a started part and its creator that has timed out
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero: creator });
            const observedPart: FocusedPart = {
                ...FocusedPartMocks.CREATOR_WITHOUT_OPPONENT,
                id: partId,
            };
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });
            const lastUpdateTime: Timestamp = new Timestamp(0, 0); // creator is stuck in 1970
            await userDAO.update(creator.id, { observedPart, lastUpdateTime });
            await signOut();

            // and given another user
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the other user deletes the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow starting a part when chosen as opponent', async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();
            // When chosen opponents updates the part document
            const result: Promise<void> = partDAO.update(partInfo.id,
                                                         {
                                                             playerZero: partInfo.creator,
                                                             playerOne: partInfo.candidate,
                                                             turn: 0,
                                                             beginning: serverTimestamp(),
                                                         });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid starting a part when setting playerZero to another user than chosenOpponent or creator', async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();

            // When chosen opponents updates the part document but puts another user as playerOne
            const update: Partial<Part> = {
                playerZero: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                playerOne: partInfo.candidate,
                turn: 0,
                beginning: serverTimestamp(),
            };
            const result: Promise<void> = partDAO.update(partInfo.id, update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid starting a part when setting playerOne to another user than chosenOpponent or creator', async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();

            // When chosen opponents updates the part document but puts another user as playerOne
            const update: Partial<Part> = {
                playerZero: partInfo.creator,
                playerOne: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                turn: 0,
                beginning: serverTimestamp(),
            };
            const result: Promise<void> = partDAO.update(partInfo.id, update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid starting part when modifying read-only fields', async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();

            const forbiddenUpdates: Partial<Part>[] = [
                { typeGame: 'P5' },
                { winner: partInfo.creator },
                { loser: partInfo.candidate },
                { result: 6 },
                { scorePlayerZero: 42 },
                { scorePlayerOne: 42 },
            ];

            for (const update of forbiddenUpdates) {
                // When chosen opponent starts the part but modifies one of the forbidden field
                const result: Promise<void> = partDAO.update(partInfo.id,
                                                             {
                                                                 ...update,
                                                                 playerZero: partInfo.creator,
                                                                 playerOne: partInfo.candidate,
                                                                 turn: 0,
                                                                 beginning: serverTimestamp(),
                                                             });
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
        it('should forbid non-player to create an event', async() => {
            // Given a part and a verified user
            const partId: string = await setupStartedPartAsPlayerZero();
            await signOut();

            await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            // When creating an event (here, a 'StartGame' event)
            const result: Promise<string> = gameEventService.startGame(partId, Player.ZERO);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow non-player to read events', async() => {
            // Given a started part with events and a verified user
            const partId: string = await setupStartedPartAsPlayerZero();
            const eventId: string = await gameEventService.startGame(partId, Player.ZERO);
            await signOut();

            await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            // When reading the event
            const result: Promise<MGPOptional<PartEvent>> = events(partId).read(eventId);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
    });
    describe('for unverified user', () => {
        it('should forbid creating a part', async() => {
            // Given a non-verified user
            const creator: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When creating a part
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid reading parts', async() => {
            // Given a part and a non-verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            await signOut();

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When reading the part
            const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid creating an event', async() => {
            // Given a started part with events and an unverified user
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);
            await signOut();

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When creating an event
            const result: Promise<string> = gameEventService.startGame(partId, Player.ZERO);

            // Then it should be forbidden
            await expectPermissionToBeDenied(result);
        });
        it('should forbid reading an event', async() => {
            // Given a started part with events and an unverified user
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);
            const eventId: string = await gameEventService.startGame(partId, Player.ZERO);
            await signOut();

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When reading an event
            const result: Promise<MGPOptional<PartEvent>> = events(partId).read(eventId);
            // Then it should be forbidden
            await expectPermissionToBeDenied(result);
        });
    });
    describe('for creator', () => {
        it('should forbid creator to change typeGame/playerZero/playerOne/beginning once a part has started', async() => {
            // Given a part that has started (i.e., beginning is set), and a player (here creator)
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({
                ...PartMocks.INITIAL,
                beginning: serverTimestamp(),
                playerZero: creator,
                playerOne: UserMocks.OPPONENT_MINIMAL_USER,
            });

            const updates: Partial<Part>[] = [
                { typeGame: 'P4' },
                { playerZero: UserMocks.OPPONENT_MINIMAL_USER },
                { playerOne: creator },
                { beginning: serverTimestamp() },
            ];
            for (const update of updates) {
                // When trying to change the field
                const result: Promise<void> = partDAO.update(partId, update);
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
        it('should allow deleting part if it has not started', async() => {
            // Given a non-started part and its owner (as defined in the configRoom)
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });

            // When deleting the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid deleting part after it has started', async() => {
            // Given a started part and its owner (as defined in the configRoom)
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({
                ...PartMocks.INITIAL,
                playerZero: creator,
                beginning: serverTimestamp(),
            });
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });

            // When deleting the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
    });
    describe('for player', () => {
        it('should forbid player to change typeGame', async() => {
            // Given a part and a player (here, creator)
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero });

            // When trying to change the game type
            const result: Promise<void> = partDAO.update(partId, { typeGame: 'P4' });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow to increment turn and decrement it for take backs', async() => {
            // Given two players
            const playerOne: MinimalUser = await createDisconnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const turnDeltas: number[] = [
                +1, // move
                -1, // take back
                -2, // take back when it was our turn again
            ];
            for (const turnDelta of turnDeltas) {
                // Given a part in the middle of being played
                const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero, playerOne });
                // need to increase the turn sufficiently for take backs
                await partDAO.update(partId, { turn: 1 });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                await partDAO.update(partId, { turn: 2 });
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
                // When updating turns with a legitimate increase/decrease
                const turn: number = 2 + turnDelta;
                const result: Promise<void> = partDAO.update(partId, { turn });
                // Then it should succeed
                await expectAsync(result).toBeResolvedTo();
            }
        });
        it('should forbid to increment or decrement the turn too much', async() => {
            // Given two players
            const playerOne: MinimalUser = await createDisconnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const turnDeltas: number[] = [
                +2,
                -3,
            ];
            for (const turnDelta of turnDeltas) {
                // Given a part in the middle of being played
                const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero, playerOne });
                // need to increase the turn sufficiently for take backs
                await partDAO.update(partId, { turn: 1 });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                await partDAO.update(partId, { turn: 2 });
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
                await partDAO.update(partId, { turn: 3 });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                // When updating turns with an illegal increase/decrease
                const turn: number = 3 + turnDelta;
                const result: Promise<void> = partDAO.update(partId, { turn });
                // Then it should fail
                await expectPermissionToBeDenied(result);

                // Need to reconnect creator for the next iteration
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
            }
        });
        it('should allow resigning', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When resigning
            const result: Promise<void> = partDAO.update(partId, {
                result: MGPResult.RESIGN.value,
                winner: playerOne, // we are resigning
                loser: playerZero,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid resigning in place of the other player', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When resigning and setting the other player as loser
            const result: Promise<void> = partDAO.update(partId, {
                result: MGPResult.RESIGN.value,
                winner: playerZero, // we're trying to be the winner
                loser: playerOne,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow timeouting a part with a timed out user', async() => {
            // Given a part where one player has timed out
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, remainingMsForOne: 1, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // Wait 10ms to ensure the player has timed out
            await new Promise((f: (value: unknown) => void) => setTimeout(f, 10));

            // When setting the part as result as timed out
            const result: Promise<void> = partDAO.update(partId, {
                result: MGPResult.TIMEOUT.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should allow setting winner and loser', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser along with a move
            const result: Promise<void> = partDAO.update(partId, {
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid setting a player both as winner and loser', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser along with a move
            const result: Promise<void> = partDAO.update(partId, {
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerZero,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid setting winner that is not player', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner or loser to an non player
            const update: Partial<Part> = {
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            };
            const winnerResult: Promise<void> = partDAO.update(
                partId,
                {
                    ...update,
                    winner: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                });
            const loserResult: Promise<void> = partDAO.update(
                partId,
                {
                    ...update,
                    loser: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                });

            // Then it should fail
            await expectPermissionToBeDenied(winnerResult);
            await expectPermissionToBeDenied(loserResult);
        });
        it('should forbid setting winner and loser without changing result', async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser without changing part result
            const result: Promise<void> = partDAO.update(partId, {
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        describe('events', () => {
            it('should forbid creating an invalid event type', async() => {
                // Given an ongoing part
                const partId: string = await setupStartedPartAsPlayerZero();

                // When creating an invalid event type
                const event: PartEvent = {
                    // We can't represent such invalid types properly with our typing
                    // but malicious clients could, so we need to make an ugly cast
                    eventType: 'Invalid' as 'Move',
                    time: serverTimestamp(),
                    player: 0,
                };
                const result: Promise<string> = events(partId).create(event);

                // Then it should fail
                await expectPermissionToBeDenied(result);
            });
            it('should forbid creating an event as the other player', async() => {
                // Given an ongoing part
                const partId: string = await setupStartedPartAsPlayerZero();

                // When creating an event as another player
                const event: PartEvent = {
                    // We can't represent such invalid types properly with our typing
                    // but malicious clients could, so we need to make an ugly cast
                    eventType: 'Action',
                    time: serverTimestamp(),
                    player: 1,
                };
                const result: Promise<string> = events(partId).create(event);

                // Then it should fail
                await expectPermissionToBeDenied(result);
            });
            it('should forbid modifying an event', async() => {
                // Given an ongoing part with an event
                const partId: string = await setupStartedPartAsPlayerZero();

                const event: PartEvent = {
                    eventType: 'Action',
                    time: serverTimestamp(),
                    player: 0,
                    action: 'StartGame',
                };
                const eventId: string = await events(partId).create(event);

                // When trying to modify the event
                const result: Promise<void> = events(partId).update(eventId, { ...event, action: 'EndGame' });

                // Then it should fail
                await expectPermissionToBeDenied(result);
            });
            it('should forbid deleting an event', async() => {
                // Given an ongoing part with an event
                const partId: string = await setupStartedPartAsPlayerZero();

                const eventId: string = await gameEventService.startGame(partId, Player.ZERO);

                // When trying to delete the event
                const result: Promise<void> = events(partId).delete(eventId);

                // Then it should fail
                await expectPermissionToBeDenied(result);
            });
            describe('moves', () => {
                it('should allow creating a move on player turn', async() => {
                    // Given an ongoing part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating a move
                    const result: Promise<string> = gameEventService.addMove(partId, Player.ZERO, { x: 0, y: 0 });

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid creating a move on opponent turn', async() => {
                    // Given an ongoing part where it is the opponent's turn
                    const partId: string = await setupStartedPartAsPlayerZero();
                    await gameEventService.addMove(partId, Player.ZERO, { x: 0, y: 0 });
                    await partDAO.update(partId, { turn: 1 });

                    // When creating a move during the opponent's turn
                    const result: Promise<string> = gameEventService.addMove(partId, Player.ZERO, { x: 0, y: 0 });

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
            });
            describe('actions', () => {
                it('should allow creating AddTurnTime action', async() => {
                    // Given an ongoing part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an AddTurnTime action
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ZERO, 'AddTurnTime');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid creating AddTurnTime action for ourselves', async() => {
                    // Given an ongoing part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an AddGlobalTime action as Player.ONE to increase our time
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ONE, 'AddTurnTime');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow creating AddGlobalTime action', async() => {
                    // Given an ongoing part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an AddGlobalTime action
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ZERO, 'AddGlobalTime');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid creating AddGlobalTime action for ourselves', async() => {
                    // Given an ongoing part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an AddGlobalTime action as Player.ONE to increase our time
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ONE, 'AddGlobalTime');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow creating StartGame action at turn 0', async() => {
                    // Given an created part at turn 0
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an StartGame action at turn 0
                    const result: Promise<string> = gameEventService.startGame(partId, Player.ZERO);

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid creating StartGame action at non-0 turn', async() => {
                    // Given an ongoing part mid-game
                    const partId: string = await setupStartedPartAsPlayerZero();
                    await expectAsync(partDAO.update(partId, { turn: 1 }));

                    // When creating a StartGame action at turn > 0
                    const result: Promise<string> = gameEventService.startGame(partId, Player.ZERO);

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow creating EndGame action upon end game', async() => {
                    // Given a part that is finished
                    const partId: string = await setupFinishedPartAsPlayerZero();

                    // When creating an EndGame action at the end
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ZERO, 'EndGame');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid creating EndGame action during game', async() => {
                    // Given a part that is not finished
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an EndGame action when the part is not finished
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ZERO, 'EndGame');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should forbid creating invalid action', async() => {
                    // Given a part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an invalid action
                    const result: Promise<string> = gameEventService.addAction(partId, Player.ZERO, 'Invalid' as 'StartGame');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
            });
            describe('requests', () => {
                it('should allow requesting draw in in-progress game', async() => {
                    // Given a part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When requesting a draw in-game
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'Draw');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid requesting draw in finished game', async() => {
                    // Given a part that is finished
                    const partId: string = await setupFinishedPartAsPlayerZero();

                    // When requesting a draw
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'Draw');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow requesting take back in in-progress game', async() => {
                    // Given a part at turn >= 1
                    const partId: string = await setupStartedPartAsPlayerZero();
                    await expectAsync(partDAO.update(partId, { turn: 1 }));

                    // When requesting a take back in-game
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'TakeBack');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid requesting take back in finished game', async() => {
                    // Given a part that is finished
                    const partId: string = await setupFinishedPartAsPlayerZero();

                    // When requesting a take back
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'TakeBack');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow proposing rematch in finished game', async() => {
                    // Given a part that is finished
                    const partId: string = await setupFinishedPartAsPlayerZero();

                    // When requesting a rematch
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'Rematch');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should forbid proposing rematch in in-progress game', async() => {
                    // Given a part in progress
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When requesting a rematch in-game
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'Rematch');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should forbid creating an invalid request', async() => {
                    // Given a part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an invalid request
                    const result: Promise<string> = gameEventService.addRequest(partId, Player.ZERO, 'Invalid' as 'TakeBack');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
            });
            describe('replys', () => {
                async function setupPartWithRequestFromZeroAsOne(requestType: RequestType, finished: boolean = false): Promise<string> {
                    const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
                    const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
                    const part: Part = { ...PartMocks.STARTED, playerZero, playerOne, turn: 0 };
                    const partId: string = await partDAO.create(part);
                    if (finished) {
                        partDAO.update(partId, {
                            turn: 1,
                            result: MGPResult.VICTORY.value,
                            winner: playerZero,
                            loser: playerOne,
                        });
                        await gameEventService.addAction(partId, Player.ZERO, 'EndGame');
                    } else {
                        partDAO.update(partId, { turn: 1 });
                    }
                    await gameEventService.addRequest(partId, Player.ZERO, requestType);
                    await signOut();
                    await reconnectUser(OPPONENT_EMAIL);
                    return partId;
                }
                it('should forbid creating an invalid reply', async() => {
                    // Given a part
                    const partId: string = await setupStartedPartAsPlayerZero();

                    // When creating an invalid reply
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ZERO, 'Maybe' as 'Accept', 'TakeBack');

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                });
                it('should allow accepting a take back request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('TakeBack');

                    // When accepting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Accept', 'TakeBack');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should allow rejecting a take back request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('TakeBack');

                    // When rejecting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Reject', 'TakeBack');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should allow accepting a rematch request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('Rematch', true);

                    // When accepting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Accept', 'Rematch');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should allow rejecting a rematch request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('TakeBack');

                    // When rejecting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Reject', 'Rematch');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should allow accepting a draw request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('Draw');

                    // When accepting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Accept', 'Draw');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
                it('should allow rejecting a draw request', async() => {
                    // Given a part with a request
                    const partId: string = await setupPartWithRequestFromZeroAsOne('Draw');

                    // When rejecting the request
                    const result: Promise<string> = gameEventService.addReply(partId, Player.ONE, 'Reject', 'Draw');

                    // Then it should succeed
                    await expectAsync(result).toBeResolved();
                });
            });
        });
    });
});
