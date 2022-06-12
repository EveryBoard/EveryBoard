/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedGoogleUser, createUnverifiedUser, signOut } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { PartDAO } from '../PartDAO';
import * as FireAuth from '@angular/fire/auth';
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
            await createConnectedGoogleUser('foo@bar.com');
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
        await createConnectedGoogleUser('foo@bar.com', 'creator');
        // When creating a part
        const result: Promise<string> = partDAO.create(PartMocks.INITIAL);
        // Then it should succeed
        await expectAsync(result).toBeResolved();

    });
    it('should forbid a non-verified user to create a part', async() => {
        // Given a non-verified user
        const token: string = '{"sub": "bar@bar.com", "email": "bar@bar.com", "email_verified": false}';
        const credential: FireAuth.UserCredential =
            await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                FireAuth.GoogleAuthProvider.credential(token));
        await userDAO.set(credential.user.uid, { verified: false, username: 'user' });

        // When creating a part
        const result: Promise<string> = partDAO.create(PartMocks.INITIAL);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid player to change playerZero/playerOne/beginning once a part has started', async() => {
        // Given a part that has started (i.e., turn >= 0), and a player (here creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        await partDAO.create({
            ...PartMocks.INITIAL,
            turn: 1,
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
    it('should forbid non-player to change writable fields', async() => {
        // Given a part, and a user who is not playing in this game
        await createConnectedGoogleUser('foo@bar.com', 'creator');
        await partDAO.create(PartMocks.INITIAL);
        await signOut();
        await createConnectedGoogleUser('bar@bar.com', 'non-player');

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
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const playerZero: MinimalUser = { id: creatorUser.uid, name: 'creator' };
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
        await createConnectedGoogleUser('foo@bar.com', 'non-playing-user');
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
        await createConnectedGoogleUser('foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();

        await createConnectedGoogleUser('bar@bar.com', 'non-player');
        // When reading the part
        const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
        // Then it should succeed
        await expectAsync(result).toBeResolvedTo(MGPOptional.of(PartMocks.INITIAL));
    });
    it('should forbid non-verified users to read parts', async() => {
        // Given a part and a non-verified user
        await createConnectedGoogleUser('foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();

        await createUnverifiedUser('bar@bar.com', 'non-verified');
        // When reading the part
        const result: Promise<MGPOptional<Part>> = partDAO.read(partId);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow owner to delete part', async() => {
        // Given a part and its owner (as defined in the joiner)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When deleting the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid verified user to delete part even if owner is not observing anymore', async() => {
        // Given a part with its owner not observing this part
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        await userDAO.update(creator.id, { observedPart: null, last_changed });
        await signOut();

        // and given another user
        await createConnectedGoogleUser('bar@bar.com', 'visitor');

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow verified user to delete part if owner has timed out', async() => {
        // Given a part with its owner who has timed out
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: 0, nanoseconds: 0 }; // owner is stuck in 1970
        await userDAO.update(creator.id, { observedPart: partId, last_changed });
        await signOut();

        // and given another user
        await createConnectedGoogleUser('bar@bar.com', 'visitor');

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid to delete a part if owner is still observing it and has not timed out', async() => {
        // Given a part with its owner
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // eslint-disable-next-line camelcase
        const last_changed: Time = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
        await userDAO.update(creator.id, { observedPart: partId, last_changed });
        await signOut();

        // and given another user
        await createConnectedGoogleUser('bar@bar.com', 'visitor');

        // When the other user deletes the part
        const result: Promise<void> = partDAO.delete(partId);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
});
