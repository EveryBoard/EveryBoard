/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { JoinerDAO } from '../JoinerDAO';
import * as FireAuth from '@angular/fire/auth';
import { PartDAO } from '../PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { FirstPlayer, Joiner, PartStatus, PartType } from 'src/app/domain/Joiner';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { createConnectedGoogleUser, createUnverifiedUser, reconnectUser } from 'src/app/services/tests/ConnectedUserService.spec';

describe('JoinerDAO', () => {

    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }

    beforeEach(async() => {
        await setupEmulators();
        joinerDAO = TestBed.inject(JoinerDAO);
        partDAO = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(joinerDAO).toBeTruthy();
    });
    it('should allow verified user to create a joiner if there is a corrpesponding part', async() => {
        // Given a verified user and an existing part
        const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const userId: string = user.uid;
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const creator: MinimalUser = { id: userId, name: 'creator' };
        // When creating the corresponding joiner, with the current user as creator
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid verified user to create a joiner if there is no corresponding part', async() => {
        // Given a verified user
        const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const userId: string = user.uid;
        const creator: MinimalUser = { id: userId, name: 'creator' };
        // When creating a joiner with no corresponding part
        const result: Promise<void> = joinerDAO.set('unexisting-part-id', { ...JoinerMocks.INITIAL, creator });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid setting a fake username as a creator', async() => {
        // Given a verified user and an existing part
        const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        // When creating the corresponding joiner, with the user as creator but with a fake username
        const creator: MinimalUser = { id: user.uid, name: 'fake-jeanjaja' };
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid creating a joiner on behalf of another user', async() => {
        // Given two users, including a malicious one, and an existing part
        const regularUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'regular');
        const regularMinimalUser: MinimalUser = { id: regularUser.uid, name: 'regular' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();
        await createConnectedGoogleUser('bar@bar.com', 'malicious');
        // When the malicious user creates the corresponding joiner on behalf of the regular user
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator: regularMinimalUser });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-verified user to create a joiner', async() => {
        // Given an existing part.
        // (Note that the non-verified user in practice can never have created the corresponding part,
        // but this is an extra check just in case)
        await createConnectedGoogleUser('foo@bar.com', 'creator');
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await signOut();

        // and a non-verified user
        const user: FireAuth.User = await createUnverifiedUser('bar@bar.com', 'user');
        const nonVerifiedUser: MinimalUser = { id: user.uid, name: 'user' };

        // When the user tries to create the joiner
        const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, nonVerifiedUser });
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow creator to change other fields than candidates and partStatus to STARTED', async() => {
        // Given a user that created a part and joiner
        const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
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
    it('should forbid the creator to change the part status to STARTED', async() => {
        // Given a user that created a part and joiner
        const user: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: user.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When creator tries to change the part status from PROPOSED to STARTED
        const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow a user to add themself to the candidates', async() => {
        // Given a part and joiner, and a verified user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };

        // When the user adds themself to the list of candidates
        const result: Promise<void> = joinerDAO.addCandidate(partId, candidate);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid a user to use a fake name in the list of candidates', async() => {
        // Given a part and joiner, and a verified user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');

        // When the user adds themself to the list of candidates with a fake name
        const result: Promise<void> = joinerDAO.addCandidate(partId, { id: candidateUser.uid, name: 'blibli' });

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid a user to add anyone else to the candidates', async() => {
        // Given a part and joiner, and two verified users (that are not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const attackedCandidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const attackedCandidate: MinimalUser = { id: attackedCandidateUser.uid, name: 'candidate' };
        await signOut();
        await createConnectedGoogleUser('attacker@bar.com', 'attacker');

        // When the user adds someone else to the list of candidates
        const result: Promise<void> = joinerDAO.addCandidate(partId, attackedCandidate);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should allow a user to remove themself from the candidates', async() => {
        // Given a part and joiner, and a candidate
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
        await joinerDAO.addCandidate(partId, candidate);

        // When the candidate removes themself from the list
        const result: Promise<void> = joinerDAO.removeCandidate(partId, candidate);

        // Then it should succeed
        await expectAsync(result).toBeResolvedTo();
    });
    it('should forbid a user to remove someone else from the candidates', async() => {
        // Given a part and joiner, with another user as candidate, and a malicious user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
        await joinerDAO.addCandidate(partId, candidate);
        await signOut();

        await createConnectedGoogleUser('malicious@bar.com', 'malicious');

        // When the malicious users tries to remove another candidate
        const result: Promise<void> = joinerDAO.removeCandidate(partId, candidate);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid changing its own candidate fields', async() => {
        // Given a part and joiner, with a candidate
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
        await joinerDAO.addCandidate(partId, candidate);

        await createConnectedGoogleUser('malicious@bar.com', 'malicious');

        // When the malicious users tries to change another candidate's fields
        const update: Partial<MinimalUser> = { name: 'foo' };
        const result: Promise<void> = joinerDAO.subCollectionDAO(partId, 'candidates').set(candidate.id, update);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid changing the fields of another candidate', async() => {
        // Given a part and joiner, with another user as candidate, and a malicious user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
        await joinerDAO.addCandidate(partId, candidate);
        await signOut();

        await createConnectedGoogleUser('malicious@bar.com', 'malicious');

        // When the malicious users tries to change another candidate's fields
        const update: Partial<MinimalUser> = { name: 'foo' };
        const result: Promise<void> = joinerDAO.subCollectionDAO(partId, 'candidates').set(candidate.id, update);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid creator to add themself to the candidates', async() => {
        // Given a part and joiner, with the current user being the creator
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

        // When trying to add itself to the candidates
        const result: Promise<void> = joinerDAO.addCandidate(partId, creator);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-verified user to add themselves to the candidates', async() => {
        // Given a part, and a non-verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();


        const user: FireAuth.User = await createUnverifiedUser('bar@bar.com', 'user');
        const nonVerifiedUser: MinimalUser = { id: user.uid, name: 'user' };
        // When adding the non-verified user to the candidates
        const result: Promise<void> = joinerDAO.addCandidate(partId, nonVerifiedUser);

        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
    it('should forbid non-creator to change other fields than status', async() => {
        // Given a part, and a user (that is not the creator)
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
        await signOut();

        const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
        const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
        // Add ourself to candidate list to try to have more privileges
        await joinerDAO.addCandidate(partId, candidate);

        const updates: Partial<Joiner>[] = [
            { chosenOpponent: candidate },
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
    describe('chosen opponent', () => {
        let partId: string;
        beforeEach(async() => {
            // Given a part with a joiner where the current user is set as chosen opponent

            // We have to follow a realistic workflow to achieve that
            // The part is first created
            const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
            const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
            partId = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            // A candidate add itself to the candidates list
            const candidateUser: FireAuth.User = await createConnectedGoogleUser('bar@bar.com', 'candidate');
            const candidate: MinimalUser = { id: candidateUser.uid, name: 'candidate' };
            await expectAsync(joinerDAO.addCandidate(partId, candidate)).toBeResolvedTo();
            await signOut();

            // The creator then selects candidates as the chosen opponent and proposes the config
            await reconnectUser('foo@bar.com');
            const update: Partial<Joiner> = { chosenOpponent: candidate, partStatus: PartStatus.CONFIG_PROPOSED.value };
            await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            // We will finally act as the chosen opponent
            await reconnectUser('bar@bar.com');
        });
        it('should allow chosen opponent to change status from PROPOSED to STARTED', async() => {
            // When the candidate accepts the config by setting partStatus
            const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid chosen opponent to change status to any other value than STARTED', async() => {
            const partStatusValues: number[] = [
                PartStatus.PART_CREATED.value,
                PartStatus.PART_FINISHED.value,
            ];

            for (const partStatus of partStatusValues) {
                // When the candidate tries to set part status to any other value
                const result: Promise<void> = joinerDAO.update(partId, { partStatus });

                // Then it should fail
                await expectFirebasePermissionDenied(result);
            }
        });
        it('should forbid chosen opponent to change status if config is not proposed', async() => {
            // And given that the part is not proposed
            await reconnectUser('foo@bar.com');
            const update: Partial<Joiner> = { partStatus: PartStatus.PART_CREATED.value };
            await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            await reconnectUser('bar@bar.com');

            const partStatusValues: number[] = [
                PartStatus.CONFIG_PROPOSED.value,
                PartStatus.PART_STARTED.value,
                PartStatus.PART_FINISHED.value,
            ];

            for (const partStatus of partStatusValues) {
                // When the candidate tries to set part status to any other value
                const result: Promise<void> = joinerDAO.update(partId, { partStatus });

                // Then it should fail
                await expectFirebasePermissionDenied(result);
            }
        });
        it('should forbid non-chosen candidate to change status to any value', async() => {
            // And given any other user who is not candidate
            await createConnectedGoogleUser('baz@bar.com', 'not-candidate');

            const partStatusValues: number[] = [
                PartStatus.PART_CREATED.value,
                PartStatus.PART_STARTED.value,
                PartStatus.PART_FINISHED.value,
            ];

            // When trying to change the status to any value
            for (const partStatus of partStatusValues) {
                // When the candidate tries to set part status to any other value
                const result: Promise<void> = joinerDAO.update(partId, { partStatus });

                // Then it should fail
                await expectFirebasePermissionDenied(result);
            }
        });
    });
    it('should allow verified users to read the joiner', async() => {
        // Given a part with a joiner, and a verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();

        await createConnectedGoogleUser('bar@bar.com', 'candidate');
        // When reading the joiner
        const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);
        // Then it succeeds
        await expectAsync(result).toBeResolvedTo(MGPOptional.of(joiner));
    });
    it('should forbid non-verified users to read the joiner', async() => {
        // Given a part, and a non-verified user
        const creatorUser: FireAuth.User = await createConnectedGoogleUser('foo@bar.com', 'creator');
        const creator: MinimalUser = { id: creatorUser.uid, name: 'creator' };
        const partId: string = await partDAO.create(PartMocks.INITIAL);
        const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
        await joinerDAO.set(partId, joiner);
        await signOut();

        await createUnverifiedUser('bar@bar.com', 'user');
        // When reading the joiner
        const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);
        // Then it should fail
        await expectFirebasePermissionDenied(result);
    });
});

