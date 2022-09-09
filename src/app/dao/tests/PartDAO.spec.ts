/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedUser, createUnverifiedUser, signOut, reconnectUser, createDisconnectedUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectPermissionToBeDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { PartDAO } from '../PartDAO';
import { UserDAO } from '../UserDAO';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { Request } from 'src/app/domain/Request';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConfigRoomDAO } from '../ConfigRoomDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConfigRoom, PartStatus } from 'src/app/domain/ConfigRoom';
import { Utils } from 'src/app/utils/utils';
import { FocusedPart } from 'src/app/domain/User';
import { FocusedPartMocks } from 'src/app/domain/mocks/FocusedPartMocks.spec';
import { ConfigRoomService } from 'src/app/services/ConfigRoomService';

type PartInfo = {
    id: string,
    part: Part,
    creator: MinimalUser,
    candidate: MinimalUser,
}

describe('PartDAO', () => {

    let partDAO: PartDAO;
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

    function updateAndBumpIndex(id: string, user: Player, lastIndex: number, update: Partial<Part>): Promise<void> {
        update = {
            ...update,
            lastUpdate: {
                index: lastIndex + 1,
                player: user.value,
            },
        };
        return partDAO.update(id, update);
    }

    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
        userDAO = TestBed.inject(UserDAO);
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        configRoomService = TestBed.inject(ConfigRoomService);
    });
    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });
    describe('for verified user', () => {
        it('should allow creating a part', fakeAsync(async() => {
            // Given a verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            // When creating a part
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        }));
        it('should forbid creating a part with the wrong playerZero', fakeAsync(async() => {
            // Given a verified user, and a verified creator
            const otherUser: MinimalUser = await createDisconnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When creating a part with another user as playerZero
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: otherUser });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid creating a part with the winner already set', fakeAsync(async() => {
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
        }));
        it('should forbid creating a part with the loser already set', fakeAsync(async() => {
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
        }));
        it('should forbid creating a part with the winner and loser already set', fakeAsync(async() => {
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
        }));
        it('should allow reading parts', fakeAsync(async() => {
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
        }));
        it('should forbid non-player to change fields', fakeAsync(async() => {
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
                { lastUpdate: { index: 1, player: 0 } },
                { turn: 42 },
                { result: 3 },
                { listMoves: [{ a: 1 }] },
                { lastUpdateTime: serverTimestamp() },
                { remainingMsForZero: 42 },
                { remainingMsForOne: 42 },
                { winner: creator },
                { loser: user },
                { scorePlayerZero: 42 },
                { scorePlayerOne: 42 },
                { request: Request.rematchProposed(Player.ZERO) },
            ];
            for (const update of updates) {
                // When trying to change the field
                const result: Promise<void> = partDAO.update(partId, update);
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        }));
        it('should forbid deleting non-started part if creator has not timed out', fakeAsync(async() => {
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
        }));
        it('should allow deleting non-started part if creator has timed out', fakeAsync(async() => {
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
        }));
        it('should forbid deleting a started part (creator has not timed out)', fakeAsync(async() => {
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
        }));
        it('should forbid deleting a started part (creator has timed out)', fakeAsync(async() => {
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
        }));
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
        it('should allow starting a part when chosen as opponent', fakeAsync(async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();
            // When chosen opponents updates the part document
            const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
            const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                             Player.ONE,
                                                             partInfo.part.lastUpdate.index,
                                                             {
                                                                 playerZero: partInfo.creator,
                                                                 playerOne: partInfo.candidate,
                                                                 turn: 0,
                                                                 beginning: serverTimestamp(),
                                                                 remainingMsForZero: remainingMs,
                                                                 remainingMsForOne: remainingMs,
                                                             });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid starting a part when setting incorrect remainingMs field for player zero', fakeAsync(async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();
            // When chosen opponents updates the part document but uses an incorrect remainingMs for player zero
            const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
            const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                             Player.ONE,
                                                             partInfo.part.lastUpdate.index,
                                                             {
                                                                 playerZero: partInfo.creator,
                                                                 playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                                                                 turn: 0,
                                                                 beginning: serverTimestamp(),
                                                                 remainingMsForZero: 42,
                                                                 remainingMsForOne: remainingMs,
                                                             });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid starting a part when setting incorrect remainingMs field for player one', fakeAsync(async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();
            // When chosen opponents updates the part document but uses an incorrect remainingMs for playerOne
            const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
            const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                             Player.ONE,
                                                             partInfo.part.lastUpdate.index,
                                                             {
                                                                 playerZero: partInfo.creator,
                                                                 playerOne: UserMocks.OPPONENT_MINIMAL_USER,
                                                                 turn: 0,
                                                                 beginning: serverTimestamp(),
                                                                 remainingMsForZero: remainingMs,
                                                                 remainingMsForOne: 42424242,
                                                             });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid starting a part when setting playerZero to another user than chosenOpponent or creator', fakeAsync(async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();

            // When chosen opponents updates the part document but puts another user as playerOne
            const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
            const update: Partial<Part> = {
                playerZero: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                playerOne: partInfo.candidate,
                turn: 0,
                beginning: serverTimestamp(),
                remainingMsForZero: remainingMs,
                remainingMsForOne: remainingMs,
            };
            const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                             Player.ONE,
                                                             partInfo.part.lastUpdate.index,
                                                             update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid starting a part when setting playerOne to another user than chosenOpponent or creator', fakeAsync(async() => {
            // Given a part ready to be started
            const partInfo: PartInfo = await preparePart();

            // When chosen opponents updates the part document but puts another user as playerOne
            const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
            const update: Partial<Part> = {
                playerZero: partInfo.creator,
                playerOne: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                turn: 0,
                beginning: serverTimestamp(),
                remainingMsForZero: remainingMs,
                remainingMsForOne: remainingMs,
            };
            const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                             Player.ONE,
                                                             partInfo.part.lastUpdate.index,
                                                             update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid starting part when modifying read-only fields', fakeAsync(async() => {
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
                // When chosen oopponent starts the part but modifies one of the forbidden field
                const remainingMs: number = ConfigRoomMocks.INITIAL.totalPartDuration * 1000;
                const result: Promise<void> = updateAndBumpIndex(partInfo.id,
                                                                 Player.ONE,
                                                                 partInfo.part.lastUpdate.index,
                                                                 {
                                                                     ...update,
                                                                     playerZero: partInfo.creator,
                                                                     playerOne: partInfo.candidate,
                                                                     turn: 0,
                                                                     beginning: serverTimestamp(),
                                                                     remainingMsForZero: remainingMs,
                                                                     remainingMsForOne: remainingMs,
                                                                 });
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }}));
    });
    describe('for unverified user', () => {
        it('should forbid creating a part', fakeAsync(async() => {
            // Given a non-verified user
            const creator: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When creating a part
            const result: Promise<string> = partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid reading parts', fakeAsync(async() => {
            // Given a part and a non-verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            await signOut();

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When reading the part
            const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
    });
    describe('for creator', () => {
        it('should forbid creator to change typeGame/playerZero/playerOne/beginning once a part has started', fakeAsync(async() => {
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
                const result: Promise<void> =
                    updateAndBumpIndex(partId, Player.ZERO, PartMocks.INITIAL.lastUpdate.index, update);
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        }));
        it('should allow deleting part if it has not started', fakeAsync(async() => {
            // Given a non-started part and its owner (as defined in the configRoom)
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
            await configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator });

            // When deleting the part
            const result: Promise<void> = partDAO.delete(partId);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid deleting part after it has started', fakeAsync(async() => {
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
        }));
    });
    describe('for player', () => {
        it('should forbid player to change typeGame', fakeAsync(async() => {
            // Given a part and a player (here, creator)
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero });

            // When trying to change the game type
            const result: Promise<void> = updateAndBumpIndex(partId,
                                                             Player.ZERO,
                                                             PartMocks.INITIAL.lastUpdate.index,
                                                             { typeGame: 'P4' });
            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should allow to increment turn and decrement it for take backs', fakeAsync(async() => {
            // Given two players
            const playerOne: MinimalUser = await createDisconnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const turnDeltasAndListMoves: [number, number[]][] = [
                [+1, [0, 1, 2]], // move
                [-1, [0]], // take back
                [-2, []], // take back when it was our turn again
            ];
            for (const [turnDelta, listMoves] of turnDeltasAndListMoves) {
                // Given a part in the middle of being played
                const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero, playerOne });
                let remainingMsForZero: number = Utils.getNonNullable(PartMocks.STARTED.remainingMsForZero);
                let remainingMsForOne: number = Utils.getNonNullable(PartMocks.STARTED.remainingMsForOne);
                // need to increase the turn sufficiently for take backs
                await updateAndBumpIndex(partId, Player.ZERO, 1,
                                         { turn: 1, listMoves: [0] });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                remainingMsForZero -= 10;
                await updateAndBumpIndex(partId, Player.ONE, 2,
                                         { turn: 2, listMoves: [0, 1], remainingMsForZero });
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
                // When updating turns with a legitimate increase/decrease
                const turn: number = 2 + turnDelta;
                if (turnDelta > 0) {
                    remainingMsForOne -= 10;
                }
                const result: Promise<void> =
                    updateAndBumpIndex(partId, Player.ZERO, 3,
                                       { turn, listMoves, remainingMsForOne });
                // Then it should succeed
                await expectAsync(result).toBeResolvedTo();
            }
        }));
        it('should forbid to increment or decrement the turn too much', fakeAsync(async() => {
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
                let remainingMsForZero: number = Utils.getNonNullable(PartMocks.STARTED.remainingMsForZero);
                let remainingMsForOne: number = Utils.getNonNullable(PartMocks.STARTED.remainingMsForOne);
                // need to increase the turn sufficiently for take backs
                await updateAndBumpIndex(partId, Player.ZERO, 1,
                                         { turn: 1, listMoves: [0] });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                remainingMsForZero -= 10;
                await updateAndBumpIndex(partId, Player.ONE, 2,
                                         { turn: 2, listMoves: [0, 1], remainingMsForZero });
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
                remainingMsForOne -= 10;
                await updateAndBumpIndex(partId, Player.ZERO, 3,
                                         { turn: 3, listMoves: [0, 1, 2], remainingMsForOne });
                await signOut();
                await reconnectUser(CANDIDATE_EMAIL);
                // When updating turns with an illegal increase/decrease
                const turn: number = 3 + turnDelta;
                remainingMsForZero -= 10;
                const result: Promise<void> =
                    updateAndBumpIndex(partId, Player.ONE, 4,
                                       { turn, listMoves: [0, 1, 2, 3], remainingMsForZero });
                // Then it should fail
                await expectPermissionToBeDenied(result);

                // Need to reconnect creator for the next iteration
                await signOut();
                await reconnectUser(CREATOR_EMAIL);
            }
        }));
        it('should allow updates to lastUpdate if it is a +1 increment and matches the player', fakeAsync(async() => {
            // Given a part and a player (here, creator)
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero });

            // When updating lastUpdate as expected
            const result: Promise<void> = updateAndBumpIndex(partId,
                                                             Player.ZERO,
                                                             PartMocks.STARTED.lastUpdate.index,
                                                             { });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid updates to lastUpdate if it increments more than once', fakeAsync(async() => {
            // Given a part and a player (here, creator)
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero });

            // When incrementing the index of lastUpdate too much
            const result: Promise<void> =
                    updateAndBumpIndex(partId, Player.ZERO, PartMocks.STARTED.lastUpdate.index + 1, { });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid updates to lastUpdate for another user', fakeAsync(async() => {
            // Given a part and a player (here, creator)
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create({ ...PartMocks.STARTED, playerZero });

            // When providing the wrong player in lastUpdate
            const result: Promise<void> =
                    updateAndBumpIndex(partId, Player.ONE, PartMocks.STARTED.lastUpdate.index, { });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should allow accepting a rematch when it was proposed by playerZero', fakeAsync(async() => {
            // Given a part where player zero proposes a rematch
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            await updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index,
                                     { request: Request.rematchProposed(Player.ZERO) });

            await signOut();
            await reconnectUser(OPPONENT_EMAIL);

            // When the player one accepts the rematch
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ONE, part.lastUpdate.index+1, {
                request: Request.rematchAccepted('Quarto', 'newPartId'),
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should allow accepting a rematch when it was proposed by playerOne', fakeAsync(async() => {
            // Given a part where player one proposes a rematch
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            await updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index,
                                     { turn: 0, listMoves: [] });

            await signOut();
            await reconnectUser(OPPONENT_EMAIL);

            await updateAndBumpIndex(partId, Player.ONE, part.lastUpdate.index+1,
                                     { request: Request.rematchProposed(Player.ONE) });

            await signOut();
            await reconnectUser(CREATOR_EMAIL);

            // When the player zero accepts the rematch
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index+2, {
                request: Request.rematchAccepted('Quarto', 'newPartId'),
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should allow accepting a rematch when it was proposed after a victory', fakeAsync(async() => {
            // Given a part where someone has won and proposed a rematch
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // Player zero wins
            await updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                listMoves: [1],
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Player zero proposes a rematch
            await updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index+1,
                                     { request: Request.rematchProposed(Player.ZERO) });

            await signOut();
            await reconnectUser(OPPONENT_EMAIL);

            // When the player one accepts the rematch
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ONE, part.lastUpdate.index+2, {
                request: Request.rematchAccepted('Quarto', 'newPartId'),
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should allow accepting a draw when it was proposed', fakeAsync(async() => {
            // Given a part where one player proposes a draw
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            await updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index,
                                     { request: Request.drawProposed(Player.ZERO) });

            await signOut();
            await reconnectUser(OPPONENT_EMAIL);

            // When the other user accepts the draw
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ONE, part.lastUpdate.index+1, {
                request: null,
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid changing the status to draw if it was not proposed', fakeAsync(async() => {
            // Given a part where one player did NOT propose a draw
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            await signOut();
            await reconnectUser(OPPONENT_EMAIL);

            // When the other user tries to change the result to draw
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ONE, part.lastUpdate.index+1, {
                request: null,
                result: MGPResult.AGREED_DRAW_BY_ONE.value,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should allow resigning', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When resigning
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                result: MGPResult.RESIGN.value,
                winner: playerOne, // we are resigning
                loser: playerZero,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid resigning in place of the other player', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When resigning and setting the other player as loser
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                result: MGPResult.RESIGN.value,
                winner: playerZero, // we're trying to be the winner
                loser: playerOne,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should allow timeouting a part with a timed out user', fakeAsync(async() => {
            // Given a part where one player has timed out
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, remainingMsForOne: 1, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // Wait 10ms to ensure the player has timed out
            await new Promise((f: (value: unknown) => void) => setTimeout(f, 10));

            // When setting the part as result as timed out
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                result: MGPResult.TIMEOUT.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        xit('should forbid timeouting a part without timed out users', fakeAsync(async() => {
            // Not tested as the security rules do not ensure proper time management yet
        }));
        it('should allow setting winner and loser with a move', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser along with a move
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                listMoves: [0],
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }));
        it('should forbid setting a player both as winner and loser', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser along with a move
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                listMoves: [0],
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerZero,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid setting winner that is not player', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner or loser to an non player
            const update: Partial<Part> = {
                listMoves: [0],
                turn: 1,
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            };
            const winnerResult: Promise<void> = updateAndBumpIndex(
                partId,
                Player.ZERO,
                part.lastUpdate.index,
                {
                    ...update,
                    winner: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                });
            const loserResult: Promise<void> = updateAndBumpIndex(
                partId,
                Player.ZERO,
                part.lastUpdate.index,
                {
                    ...update,
                    loser: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
                });

            // Then it should fail
            await expectPermissionToBeDenied(winnerResult);
            await expectPermissionToBeDenied(loserResult);
        }));
        it('should forbid setting winner and loser without move, resigning, or timeout', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser without sending a move
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                result: MGPResult.VICTORY.value,
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        it('should forbid setting winner and loser without changing result', fakeAsync(async() => {
            // Given an ongoing part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);

            // When setting the winner and loser without changing part result
            const result: Promise<void> = updateAndBumpIndex(partId, Player.ZERO, part.lastUpdate.index, {
                winner: playerZero,
                loser: playerOne,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        }));
        async function checkTimeUpdate(
            player: Player,
            updateTime: (currentTimeZero: number, currentTimeOne: number) => Partial<Part>,
            expectedToSucceed: boolean)
        : Promise<void>
        {
            // Given a player, and a part
            const playerOne: MinimalUser = await createDisconnectedUser(OPPONENT_EMAIL, OPPONENT_NAME);
            const playerZero: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            const part: Part = { ...PartMocks.STARTED, playerZero, playerOne };
            const partId: string = await partDAO.create(part);
            let index: number = 1;
            if (player === Player.ONE) {
                await updateAndBumpIndex(partId, Player.ZERO, index, { turn: 1, listMoves: [1] });
                index += 1;
                await signOut();
                await reconnectUser(OPPONENT_EMAIL);
            }

            // When updating a time
            const update: Partial<Part> = updateTime(Utils.getNonNullable(part.remainingMsForZero),
                                                     Utils.getNonNullable(part.remainingMsForOne));
            const result: Promise<void> = updateAndBumpIndex(partId, player, index, update);
            if (expectedToSucceed) {
                // Then it should succeed
                await expectAsync(result).toBeResolvedTo();
            } else {
                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        }
        describe('decreasing time', () => {
            it('should allow decreasing its own time outside of move (as playerZero)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero - 1000 };
                                      }, true);
            }));
            xit('should forbid decreasing its own time during move (as playerZero)', fakeAsync(async() => {
                // Test disabled because this is not something we are currently checking in the security rules
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero - 1000, turn: 1, listMoves: [1] };
                                      }, false);
            }));
            it('should allow decreasing the time of the opponent outside of move (as playerZero)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one - 1000 };
                                      }, true);
            }));
            it('should allow decreasing the time of the opponent during move (as playerZero)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one - 1000, turn: 1, listMoves: [1] };
                                      }, true);
            }));
            it('should allow decreasing its own time outside of move (as playerOne)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one - 1000 };
                                      }, true);
            }));
            xit('should forbid decreasing its own time during move (as playerOne)', fakeAsync(async() => {
                // Test disabled because this is not something we are currently checking in the security rules
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one - 1000, turn: 2, listMoves: [1, 2] };
                                      }, false);
            }));
            it('should allow decreasing the time of the opponent outside of move (as playerOne)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero - 1000 };
                                      }, true);
            }));
            it('should allow decreasing the time of the opponent during move (as playerOne)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero - 1000, turn: 2, listMoves: [1, 2] };
                                      }, true);
            }));

        });
        describe('increasing time', () => {
            it('should allow increasing the time of the opponent (as playerZero)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one + 1000 };
                                      }, true);
            }));
            it('should forbid increasing its own time (as playerZero)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ZERO,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero + 1000 };
                                      }, false);
            }));
            it('should allow increasing the time of the opponent (as playerOne)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForZero: zero + 1000 };
                                      }, true);
            }));
            it('should forbid increasing its own time (as playerOne)', fakeAsync(async() => {
                await checkTimeUpdate(Player.ONE,
                                      (zero: number, one: number): Partial<Part> => {
                                          return { remainingMsForOne: one + 1000 };
                                      }, false);
            }));
        });
    });
});
