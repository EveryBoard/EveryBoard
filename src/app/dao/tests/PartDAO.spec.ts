/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { createUser, createUnverifiedUser, signOut } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { PartDAO } from '../PartDAO';
import { UserDAO } from '../UserDAO';
import { serverTimestamp } from 'firebase/firestore';
import { Request } from 'src/app/domain/Request';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { JoinerDAO } from '../JoinerDAO';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { Time } from 'src/app/domain/Time';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('PartDAO', () => {

    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let joinerDAO: JoinerDAO;

    const CREATOR_EMAIL: string = UserMocks.CREATOR_AUTH_USER.email.get();
    const CREATOR_NAME: string = UserMocks.CREATOR_AUTH_USER.username.get();

    const CANDIDATE_EMAIL: string = UserMocks.CANDIDATE_AUTH_USER.email.get();
    const CANDIDATE_NAME: string = UserMocks.CANDIDATE_AUTH_USER.username.get();

    const MALICIOUS_EMAIL: string = 'm@licio.us';
    const MALICIOUS_NAME: string = 'malicious';


    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
        userDAO = TestBed.inject(UserDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
    });
    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });
    describe('observeActiveParts', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirestoreCollectionObserver<Part> = new FirestoreCollectionObserver<Part>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(partDAO, 'observingWhere');
            partDAO.observeActiveParts(callback);
            expect(partDAO.observingWhere).toHaveBeenCalledWith([['result', '==', MGPResult.UNACHIEVED.value]], callback);
        });
    });
    describe('updateAndBumpIndex', () => {
        it('Should delegate to update and bump index', async() => {
            // Given a PartDAO and an update to make to the part
            spyOn(partDAO, 'update').and.resolveTo();
            const update: Partial<Part> = {
                turn: 42,
            };

            // When calling updateAndBumpIndex
            await partDAO.updateAndBumpIndex('partId', Player.ZERO, 73, update);

            // Then update should have been called with lastUpdate infos added to it
            const expectedUpdate: Partial<Part> = {
                lastUpdate: {
                    index: 74,
                    player: Player.ZERO.value,
                },
                turn: 42,
            };
            expect(partDAO.update).toHaveBeenCalledOnceWith('partId', expectedUpdate);
        });
    });
    describe('userHasActivePart', () => {
        const part: Part = {
            lastUpdate: {
                index: 0,
                player: 0,
            },
            typeGame: 'P4',
            playerZero: UserMocks.CREATOR_MINIMAL_USER,
            turn: 0,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        beforeEach(async() => {
            // These tests need a logged in user to create documents
            await createUser(CREATOR_EMAIL, CREATOR_NAME);
        });
        it('should return true when user has an active part as player zero', async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerZero: UserMocks.OPPONENT_MINIMAL_USER });
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(UserMocks.OPPONENT_MINIMAL_USER);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return true when user has an active part as player one', async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerOne: UserMocks.OPPONENT_MINIMAL_USER });
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(UserMocks.OPPONENT_MINIMAL_USER);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return false when the user has no active part', async() => {
            // Given a part where the user is not active
            await partDAO.create(part);
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(UserMocks.OPPONENT_MINIMAL_USER);
            // Then it should return false
            expect(result).toBeFalse();

        });
        afterEach(async() => {
            await signOut();
        });
    });
    it('should allow a verified user to create a part', async() => {
        // Given a verified user
        await createUser(CREATOR_EMAIL, CREATOR_NAME);
        // When creating a part
        const result: Promise<string> = partDAO.create(PartMocks.INITIAL);
        // Then it should succeed
        await expectAsync(result).toBeResolved();

    });
    it('should forbid a non-verified user to create a part', async() => {
        // Given a non-verified user
        await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

        // When creating a part
        const result: Promise<string> = partDAO.create(PartMocks.INITIAL);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid player to change playerZero/playerOne/beginning once a part has started', async() => {
        // Given a part that has started (i.e., beginning is set), and a player (here creator)
        const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        await partDAO.create({
            ...PartMocks.INITIAL,
            beginning: serverTimestamp(),
            playerZero: creator,
            playerOne: UserMocks.OPPONENT_MINIMAL_USER,
        });

        const updates: Partial<Part>[] = [
            { playerZero: UserMocks.OPPONENT_MINIMAL_USER },
            { playerOne: creator },
            { beginning: serverTimestamp() },
        ];
        for (const update of updates) {
            // When trying to change the field
            const result: Promise<void> = partDAO.update('partId', update);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        }
    });
    it('should forbid non-player to change fields', async() => {
        // Given a part, and a user who is not playing in this game
        await createUser(CREATOR_EMAIL, CREATOR_NAME);
        await partDAO.create(PartMocks.INITIAL);
        await signOut();
        await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

        const updates: Partial<Part>[] = [
            { lastUpdate: { index: 1, player: 0 } },
            { turn: 42 },
            { result: 3 },
            { listMoves: [{ a: 1 }] },
            { lastUpdateTime: serverTimestamp() },
            { remainingMsForZero: 42 },
            { remainingMsForOne: 42 },
            { winner: 'me!' },
            { loser: 'you' },
            { scorePlayerZero: 42 },
            { scorePlayerOne: 42 },
            { request: Request.rematchProposed(Player.ZERO) },
        ];
        for (const update of updates) {
            // When trying to change the field
            const result: Promise<void> = partDAO.update('partId', update);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        }
    });
    it('should forbid player to change typeGame', async() => {
        // Given a part and a player
        const playerZero: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        await partDAO.create({ ...PartMocks.INITIAL, playerZero });

        // When trying to change the game type
        const result: Promise<void> = partDAO.update('partId', { typeGame: 'P4' });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow player to change writable fields', async() => {
        const updates: Partial<Part>[] = [
            { lastUpdate: { index: 1, player: 0 } },
            { turn: 42 },
            { result: 3 },
            { listMoves: [{ a: 1 }] },
            { lastUpdateTime: serverTimestamp() },
            { remainingMsForZero: 42 },
            { remainingMsForOne: 42 },
            { winner: 'me!' },
            { loser: 'you' },
            { scorePlayerZero: 42 },
            { scorePlayerOne: 42 },
            { request: Request.rematchProposed(Player.ZERO) },
        ];
        // Given a user who is not playing in this game
        await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
        await partDAO.create(PartMocks.INITIAL);

        for (const update of updates) {
            // When trying to change the field
            const result: Promise<void> = partDAO.update('partId', update);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        }
    });
    it('should allow verified users to read parts', async() => {
        // Given a part and a verified user
        await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();

        await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
        // When reading the part
        const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
        // Then it should succeed
        await expectAsync(result).toBeResolvedTo(MGPOptional.of(PartMocks.INITIAL));
    });
    it('should forbid non-verified users to read parts', async() => {
        // Given a part and a non-verified user
        await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();

        await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
        // When reading the part
        const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow owner to delete part if it has not started', async() => {
        // Given a non-started part and its owner (as defined in the joiner)
        const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When deleting the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid owner to delete part when it has started', async() => {
        console.log('TODO')
        // TODO: similar tests for joiner deletion
    });
    it('should forbid verified user to delete part even if owner is not observing anymore', async() => {
        // Given a part with its owner not observing this part
        const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        await userDAO.update(creator.id, { observedPart: null, last_changed });
        await signOut();

        // and given another user
        await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow verified user to delete non-started part if owner has timed out', async() => {
        // Given a non-started part with its owner who has timed out
        const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: 0, nanoseconds: 0 }; // owner is stuck in 1970
        // eslint-disable-next-line camelcase
        await userDAO.update(creator.id, { observedPart: partId, last_changed });
        await signOut();

        // and given another user
        await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid to delete a non-started part if owner is still observing it and has not timed out', async() => {
        // Given a part with its owner
        const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        await userDAO.update(creator.id, { observedPart: partId, last_changed });
        await signOut();

        // and given another user
        await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow player to increment turn and decrement it for take backs', async() => {
        console.log('TODO')
    });
    it('should forbid player to incrementi or decrementi the turn too much', async() => {
        console.log('TODO')
    });
    it('should allow updates to lastUpdate if it is a +1 increment and matches the player', async() => {
    });
    it('should forbid updates to lastUpdate if it increments more than once', async() => {
    });
    it('should forbid updates to lastUpdate for another user', async() => {
    });
});
