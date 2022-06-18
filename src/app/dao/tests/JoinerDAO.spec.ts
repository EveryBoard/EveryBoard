/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { JoinerDAO } from '../JoinerDAO';
import { PartDAO } from '../PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { FirstPlayer, Joiner, PartStatus, PartType } from 'src/app/domain/Joiner';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { createUnverifiedUser, createUser, reconnectUser, signOut } from 'src/app/services/tests/ConnectedUserService.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('JoinerDAO', () => {

    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;

    const CREATOR_EMAIL: string = UserMocks.CREATOR_AUTH_USER.email.get();
    const CREATOR_NAME: string = UserMocks.CREATOR_AUTH_USER.username.get();

    const CANDIDATE_EMAIL: string = UserMocks.CANDIDATE_AUTH_USER.email.get();
    const CANDIDATE_NAME: string = UserMocks.CANDIDATE_AUTH_USER.username.get();

    const MALICIOUS_EMAIL: string = 'm@licio.us';
    const MALICIOUS_NAME: string = 'malicious';

    beforeEach(async() => {
        await setupEmulators();
        joinerDAO = TestBed.inject(JoinerDAO);
        partDAO = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(joinerDAO).toBeTruthy();
    });

    describe('chosen opponent', () => {
    });
    describe('for non-verified users', () => {
        it('should forbid to create a joiner', async() => {
            // Given an existing part.
            // (Note that the non-verified user in practice can never have created the corresponding part,
            // but this is an extra check just in case)
            await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await signOut();

            // and a non-verified user
            const nonVerifiedUser: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user tries to create the joiner
            const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, nonVerifiedUser });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to add themselves to the candidates', async() => {
            // Given a part, and a non-verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
            await joinerDAO.set(partId, joiner);
            await signOut();

            const nonVerifiedUser: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When adding the non-verified user to the candidates
            const result: Promise<void> = joinerDAO.addCandidate(partId, nonVerifiedUser);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to read the joiner', async() => {
            // Given a part, and a non-verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
            await joinerDAO.set(partId, joiner);
            await signOut();

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When reading the joiner
            const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
    });
    describe('for verified users', () => {
        it('should allow to read the joiner', async() => {
            // Given a part with a joiner, and a verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            const joiner: Joiner = { ...JoinerMocks.INITIAL, creator };
            await joinerDAO.set(partId, joiner);
            await signOut();

            await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

            // When reading the joiner
            const result: Promise<MGPOptional<Joiner>> = joinerDAO.read(partId);

            // Then it succeeds
            await expectAsync(result).toBeResolvedTo(MGPOptional.of(joiner));
        });
        it('should allow to create a joiner if there is a corrpesponding part', async() => {
            // Given a verified user and an existing part
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);

            // When creating the corresponding joiner, with the current user as creator
            const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to create a joiner if there is no corresponding part', async() => {
            // Given a verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);

            // When creating a joiner with no corresponding part
            const result: Promise<void> = joinerDAO.set('unexisting-part-id', { ...JoinerMocks.INITIAL, creator });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid creating a joiner on behalf of another user', async() => {
            // Given two users, including a malicious verified one, and an existing part
            const regularUser: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await signOut();
            await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious user creates the corresponding joiner on behalf of the regular user
            const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator: regularUser });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid a to use a fake name in the list of candidates', async() => {
            // Given a part and joiner, and a verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user adds themself to the list of candidates with a fake name
            const result: Promise<void> = joinerDAO.addCandidate(partId, { id: candidate.id, name: 'blibli' });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid a to add anyone else to the candidates', async() => {
            // Given a part and joiner, and two verified users
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const attackedCandidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await signOut();
            await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user adds someone else to the list of candidates
            const result: Promise<void> = joinerDAO.addCandidate(partId, attackedCandidate);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should allow to add themself to the candidates', async() => {
            // Given a part and joiner, and a verified user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

            // When the user adds themself to the list of candidates
            const result: Promise<void> = joinerDAO.addCandidate(partId, candidate);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to remove someone else from the candidates', async() => {
            // Given a part and joiner, with another user as candidate, and a malicious user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await joinerDAO.addCandidate(partId, candidate);
            await signOut();

            await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious users tries to remove another candidate
            const result: Promise<void> = joinerDAO.removeCandidate(partId, candidate);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid changing the fields of another candidate', async() => {
            // Given a part and joiner, with another user as candidate, and a malicious user
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_EMAIL);
            await joinerDAO.addCandidate(partId, candidate);
            await signOut();

            await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious users tries to change another candidate's fields
            const update: Partial<MinimalUser> = { name: 'foo' };
            const result: Promise<void> = joinerDAO.subCollectionDAO(partId, 'candidates').update(candidate.id, update);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
    });
    describe('for creator', () => {
        it('should forbid setting a fake username as a creator', async() => {
            // Given a verified user and an existing part
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);

            // When creating the corresponding joiner, with the user as creator but with a fake username
            const fakeCreator: MinimalUser = { id: creator.id, name: 'fake-jeanjaja' };
            const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, fakeCreator });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid non-verified user to create a joiner', async() => {
            // Given an existing part.
            // (Note that the non-verified user in practice can never have created the corresponding part,
            // but this is an extra check just in case)
            await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await signOut();

            // and a non-verified user
            const nonVerifiedUser: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user tries to create the joiner
            const result: Promise<void> = joinerDAO.set(partId, { ...JoinerMocks.INITIAL, nonVerifiedUser });

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to add themself to the candidates', async() => {
            // Given a part and joiner, with the current user being the creator
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

            // When trying to add itself to the candidates
            const result: Promise<void> = joinerDAO.addCandidate(partId, creator);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should allow to change other fields than candidates and partStatus to STARTED', async() => {
            // Given a user that created a (non-started) part and joiner
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });

            const updates: Partial<Joiner>[] = [
                { chosenOpponent: UserMocks.CANDIDATE_MINIMAL_USER },
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
        describe('on started part', () => {
            let partId: string;
            beforeEach(async() => {
                // Given a part that is started

                // Creator creates the joiner
                const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
                partId = await partDAO.create(PartMocks.INITIAL);
                await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
                await signOut();

                // A candidate adds themself to the candidates list
                const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
                await expectAsync(joinerDAO.addCandidate(partId, candidate)).toBeResolvedTo();
                await signOut();

                // The creator then selects candidates as the chosen opponent and proposes the config
                await reconnectUser(CREATOR_EMAIL);
                const update: Partial<Joiner> = {
                    chosenOpponent: candidate,
                    partStatus: PartStatus.CONFIG_PROPOSED.value
                };
                await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
                await signOut();

                // The chosen opponent then accepts the part
                await reconnectUser(CANDIDATE_EMAIL);
                const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });
                await expectAsync(result).toBeResolvedTo();

                // And we act as the creator
                await reconnectUser(CREATOR_EMAIL);
            });
            it('should allow to change partStatus to FINISHED after it is STARTED', async() => {
                // When changing partStatus to FINISHED
                const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_FINISHED.value });

                // Then it should succeed
                await expectAsync(result).toBeResolvedTo();
            });
            it('should forbid to change fields after part has started', async() => {
                const updates: Partial<Joiner>[] = [
                    { chosenOpponent: UserMocks.CANDIDATE_MINIMAL_USER },
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
        });
    });
    describe('for non-chosen candidate', () => {
        it('should allow to remove themself from the candidates', async() => {
            // Given a part and joiner, and a candidate
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await joinerDAO.addCandidate(partId, candidate);

            // When the candidate removes themself from the list
            const result: Promise<void> = joinerDAO.removeCandidate(partId, candidate);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid changing its own candidate fields', async() => {
            // Given a part and joiner, with a candidate
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await joinerDAO.addCandidate(partId, candidate);
            await signOut();

            await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious users tries to change one of its own candidate's fields
            const update: Partial<MinimalUser> = { name: 'foo' };
            const result: Promise<void> = joinerDAO.subCollectionDAO(partId, 'candidates').set(candidate.id, update);

            // Then it should fail
            await expectFirebasePermissionDenied(result);
        });
        it('should forbid to change fields', async() => {
            // Given a part, and a candidate (that is not the creator)
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            const partId: string = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            const candidate: MinimalUser = await createUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
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
    });
    describe('for chosen opponent', () => {
        let partId: string;
        beforeEach(async() => {
            // Given a joiner where the current user is set as chosen opponent

            // We have to follow a realistic workflow to achieve that
            // The part is first created
            const creator: MinimalUser = await createUser(CREATOR_EMAIL, CREATOR_NAME);
            partId = await partDAO.create(PartMocks.INITIAL);
            await joinerDAO.set(partId, { ...JoinerMocks.INITIAL, creator });
            await signOut();

            // A candidate adds themself to the candidates list
            const candidate: MinimalUser = await createUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await expectAsync(joinerDAO.addCandidate(partId, candidate)).toBeResolvedTo();
            await signOut();

            // The creator then selects candidates as the chosen opponent and proposes the config
            await reconnectUser(CREATOR_EMAIL);
            const update: Partial<Joiner> = { chosenOpponent: candidate, partStatus: PartStatus.CONFIG_PROPOSED.value };
            await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            // We will finally act as the chosen opponent
            await reconnectUser(CANDIDATE_EMAIL);
        });
        it('should allow to change status from PROPOSED to STARTED', async() => {
            // When the candidate accepts the config by setting partStatus
            const result: Promise<void> = joinerDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to change status from PROPOSED to any other value than STARTED', async() => {
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
        it('should forbid to change status if status is not PROPOSED', async() => {
            // And given that the part is not proposed
            await reconnectUser(CREATOR_EMAIL);
            const update: Partial<Joiner> = { partStatus: PartStatus.PART_CREATED.value };
            await expectAsync(joinerDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            await reconnectUser(CANDIDATE_EMAIL);

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
    });
});
