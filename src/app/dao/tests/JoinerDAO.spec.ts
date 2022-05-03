/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { JoinerDAO } from '../JoinerDAO';
import * as FireAuth from '@angular/fire/auth';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import { PartDAO } from '../PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { UserDAO } from '../UserDAO';
import { FirstPlayer, Joiner, PartStatus, PartType } from 'src/app/domain/Joiner';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('JoinerDAO', () => {

    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;
    let userDAO: UserDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }

    beforeEach(async() => {
        await setupEmulators();
        joinerDAO = TestBed.inject(JoinerDAO);
        partDAO = TestBed.inject(PartDAO);
        userDAO = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(joinerDAO).toBeTruthy();
    });
    it('should allow verified user to create a joiner if there is a corrpesponding part', async() => {
        // Given a verified user and an existing part
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const userId: string = user.uid;
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const creator: MinimalUser = { id: userId, name: 'creator' };
        // When creating the corresponding joiner, with the user as creator
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid verified user to create a joiner if there is no corresponding part', async() => {
        // Given a verified user
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const userId: string = user.uid;
        const creator: MinimalUser = { id: userId, name: 'creator' };
        // When creating a joiner with no corresponding part
        const result: Promise<void> = joinerDAO.set('unexisting-part-id', { ...JoinerMocks.INITIAL, creator });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid setting a fake username as a creator', async() => {
        // Given a verified user and an existing part
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        // When creating the corresponding joiner, with the user as creator but with a fake username
        const creator: MinimalUser = { id: user.uid, name: 'fake-jeanjaja' };
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid creating a joiner on behalf of another user', async() => {
        // Given two users, including a malicious one, and an existing part
        const regularUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'regular');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const regularMinimalUser: MinimalUser = { id: regularUser.uid, name: 'regular' };
        await signOut();
        await createConnectedGoogleUser(true, 'bar@bar.com', 'malicious');
        // When the malicious user creates the corresponding joiner on behalf of the regular user
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator: regularMinimalUser });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-verified user to create a joiner', async() => {
        // Given an existing part.
        // (Note that the non-verified user in practice can never have created the corresponding part,
        // but this is an extra check just in case)
        await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);

        await signOut();
        // and a non-verified user
        const token: string = '{"sub": "bar@bar.com", "email": "bar@bar.com", "email_verified": false}';
        const credential: FireAuth.UserCredential =
            await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                FireAuth.GoogleAuthProvider.credential(token));
        await userDAO.set(credential.user.uid, { verified: false, username: 'user' });
        const nonVerifiedUser: MinimalUser = { id: credential.user.uid, name: 'user' };
        // When the user tries to create the joiner
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, nonVerifiedUser });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow creator to change other fields than candidates and partStatus to STARTED', async() => {
        // Given a user that created a part and joiner
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: user.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        const updates: Partial<Joiner>[] = [
            { chosenPlayer: 'candidate' },
            { partStatus: PartStatus.CONFIG_PROPOSED.value },
            { firstPlayer: FirstPlayer.CHOSEN_PLAYER.value },
            { partType: PartType.BLITZ.value },
            { maximalMoveDuration: 73 },
            { totalPartDuration: 1001001 },
        ];
        for (const update of updates) {
            // When modifying a field
            const result: Promise<void> = joinerDAO.update(partId, update);
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        }
    });
    it('should forbid the creator to change partStatus STARTED', async() => {
        // Given a user that created a part and joiner
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: user.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When changing part status from PROPOSED to STARTED
        const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid the creator to change the list of candidates', async() => {
        // Given a user that created a part and joiner
        const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: user.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When changing the candidates list
        const result: Promise<void> = joinerDAO.update(partId, { candidates: ['i-dont-want-to-play'] });

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-creator to change other fields than candidate or status', async() => {
        // Given a part, and a user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');

        const updates: Partial<Joiner>[] = [
            { chosenPlayer: 'candidate' },
            { partStatus: PartStatus.CONFIG_PROPOSED.value },
            { firstPlayer: FirstPlayer.CHOSEN_PLAYER.value },
            { partType: PartType.BLITZ.value },
            { maximalMoveDuration: 73 },
            { totalPartDuration: 1001001 },
        ];
        for (const update of updates) {
            // When modifying a field
            const result: Promise<void> = joinerDAO.update(partId, update);
            // Then it should fail
            await expectFirebasePermissionDenied(result);
        }
    });
    it('should allow verified users to add themselves to candidates', async() => {
        // Given a part, and a user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');
        // When adding itself to the candidate list
        const result: Promise<void> = joinerDAO.update(partId, { candidates: ['candidate'] });
        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid setting a fake username as a candidate', async() => {
        // TODO: we currently can't ensure that
        // Given a part, and a user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');
        // When adding another user name to the candidate list
        const result: Promise<void> = joinerDAO.update(partId, { candidates: ['not-myself'] });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    xit('should forbid verified users to change other candidate when adding themselves', async() => {
        // TODO We currently can't handle that
    });
    it('should allow chosenPlayer non-creator to change status only from PROPOSED to STARTED', async() => {
        // Given a part with a joiner where the current user is set as chosenPlayer

        // We have to follow a realistic workflow to achieve that
        // The part is first created
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        // A candidate add itself to the candidates list
        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');
        await expectAsync(joinerDAO.update(partId, { candidates: ['candidate'] })).toBeResolvedTo();
        await signOut();

        // The creator then selects candidates as chosenPlayer
        const creatorToken: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
        await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                            FireAuth.GoogleAuthProvider.credential(creatorToken));
        const update: Partial<Joiner> = { chosenPlayer: 'candidate', partStatus: PartStatus.CONFIG_PROPOSED.value };
        await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
        await signOut();

        // When the candidate accepts the config by setting partStatus
        const candidateToken: string = '{"sub": "bar@bar.com", "email": "bar@bar.com", "email_verified": true}';
        await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                            FireAuth.GoogleAuthProvider.credential(candidateToken));
        const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid non-chosen player to change status from PROPOSED to STARTED', async() => {
        // Given a part with a joiner where the current user is set as chosenPlayer

        // We have to follow a realistic workflow to achieve that
        // The part is first created
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        // A candidate add itself to the candidates list
        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');
        await expectAsync(joinerDAO.update(partId, { candidates: ['candidate'] })).toBeResolvedTo();
        await signOut();

        // The creator then selects candidates as chosenPlayer
        const creatorToken: string = '{"sub": "foo@bar.com", "email": "foo@bar.com", "email_verified": true}';
        const update: Partial<Joiner> = { chosenPlayer: 'candidate', partStatus: PartStatus.CONFIG_PROPOSED.value };
        await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                            FireAuth.GoogleAuthProvider.credential(creatorToken));
        await expectAsync(joinerDAO.update(partId, { chosenPlayer: 'candidate' })).toBeResolvedTo();
        await signOut();

        // When another player tries to start the part
        await createConnectedGoogleUser(true, 'baz@bar.com', 'other');
        const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-verified user to add themselves to candidates', async() => {
        // Given a part, and a non-verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();

        const token: string = '{"sub": "bar@bar.com", "email": "bar@bar.com", "email_verified": false}';
        const credential: FireAuth.UserCredential =
            await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                FireAuth.GoogleAuthProvider.credential(token));
        await userDAO.set(credential.user.uid, { verified: false, username: 'user' });
        // When adding the non-verified user to the candidates
        const result: Promise<void> = joinerDAO.update(partId, { candidates: ['user'] });
        // Then it should fail
        await expectFirebasePermissionDenied(result);

    });
    it('should allow verified users to read the joiner', async() => {
        // Given a part, and a verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();

        await createConnectedGoogleUser(true, 'bar@bar.com', 'candidate');
        // When reading the joiner
        const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);
        // Then it succeeds
        await expectAsync(result).toBeResolvedTo(MGPOptional.of(joiner));
    });
    it('should forbid non-verified users to read the joiner', async() => {
        // Given a part, and a non-verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();

        const token: string = '{"sub": "bar@bar.com", "email": "bar@bar.com", "email_verified": false}';
        const credential: FireAuth.UserCredential =
            await FireAuth.signInWithCredential(TestBed.inject(FireAuth.Auth),
                                                FireAuth.GoogleAuthProvider.credential(token));
        await userDAO.set(credential.user.uid, { verified: false, username: 'user' });
        // When reading the joiner
        const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
});
