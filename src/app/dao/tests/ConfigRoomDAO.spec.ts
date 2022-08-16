/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { expectPermissionToBeDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { ConfigRoomDAO } from '../ConfigRoomDAO';
import { PartDAO } from '../PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { createUnverifiedUser, createConnectedUser, reconnectUser, signOut } from 'src/app/services/tests/ConnectedUserService.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

interface TestOptions {
    signOut?: boolean,
    createConfigRoom?: boolean,
}

type CreatedPart = {
    partId: string,
    creator: MinimalUser,
}

describe('ConfigRoomDAO', () => {

    let partDAO: PartDAO;
    let configRoomDAO: ConfigRoomDAO;

    const CREATOR_EMAIL: string = UserMocks.CREATOR_AUTH_USER.email.get();
    const CREATOR_NAME: string = UserMocks.CREATOR_AUTH_USER.username.get();

    const CANDIDATE_EMAIL: string = UserMocks.CANDIDATE_AUTH_USER.email.get();
    const CANDIDATE_NAME: string = UserMocks.CANDIDATE_AUTH_USER.username.get();

    const MALICIOUS_EMAIL: string = 'm@licio.us';
    const MALICIOUS_NAME: string = 'malicious';

    beforeEach(async() => {
        await setupEmulators();
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        partDAO = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(configRoomDAO).toBeTruthy();
    });

    const defaultOptions: TestOptions = {
        signOut: false,
        createConfigRoom: false,
    };
    async function createPart(options: TestOptions = defaultOptions): Promise<CreatedPart> {
        const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);
        const partId: string = await partDAO.create({ ...PartMocks.INITIAL, playerZero: creator });
        if (options.createConfigRoom === true) {
            const configRoom: ConfigRoom = { ...ConfigRoomMocks.INITIAL, creator };
            await configRoomDAO.set(partId, configRoom);
        }
        if (options.signOut === true) {
            await signOut();
        }
        return { partId, creator };
    }
    async function addCandidate(partId: string, signOutUser: boolean = true): Promise<MinimalUser> {
        const candidate: MinimalUser = await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
        await configRoomDAO.addCandidate(partId, candidate);
        if (signOutUser) {
            await signOut();
        }
        return candidate;
    }
    describe('for non-verified users', () => {
        it('should forbid to create a configRoom', async() => {
            // Given an existing part.
            // (Note that the non-verified user in practice can never have created the corresponding part,
            // but this is an extra check just in case)
            const partId: string = (await createPart({ signOut: true })).partId;

            // and a non-verified user
            const nonVerifiedUser: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user tries to create the configRoom
            const result: Promise<void> =
                configRoomDAO.set(partId, { ...ConfigRoomMocks.INITIAL, creator: nonVerifiedUser });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to join the list of candidates', async() => {
            // Given a part with a configRoom, and a non-verified user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;

            const nonVerifiedUser: MinimalUser = await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);
            // When the user joins the list of candidates
            const result: Promise<void> = configRoomDAO.addCandidate(partId, nonVerifiedUser);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to read the configRoom', async() => {
            // Given a part with a configRoom, and a non-verified user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;

            await createUnverifiedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When reading the configRoom
            const result: Promise<MGPOptional<ConfigRoom>> = configRoomDAO.read(partId);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
    });
    describe('for verified users', () => {
        it('should allow to read the configRoom', async() => {
            // Given a part with a configRoom, and a verified user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

            // When reading the configRoom
            const result: Promise<MGPOptional<ConfigRoom>> = configRoomDAO.read(partId);

            // Then it succeeds
            await expectAsync(result).toBeResolved();
        });
        it('should allow to create a configRoom if there is a corresponding part', async() => {
            // Given a verified user and an existing part without a configRoom
            const createdPart: CreatedPart = await createPart({ createConfigRoom: false, signOut: true });
            await reconnectUser(CREATOR_EMAIL);

            // When creating the corresponding configRoom, with the current user as creator
            const result: Promise<void> = configRoomDAO.set(createdPart.partId, {
                ...ConfigRoomMocks.INITIAL,
                creator: createdPart.creator,
            });

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid to create a configRoom if there is no corresponding part', async() => {
            // Given a verified user
            const creator: MinimalUser = await createConnectedUser(CREATOR_EMAIL, CREATOR_NAME);

            // When creating a configRoom with no corresponding part
            const result: Promise<void> = configRoomDAO.set('unexisting-part-id', { ...ConfigRoomMocks.INITIAL, creator });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid creating a configRoom on behalf of another user', async() => {
            // Given two users, including a malicious verified one, and an existing part without a configRoom
            const createdPart: CreatedPart = await createPart({ createConfigRoom: false, signOut: true });
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious user creates the corresponding configRoom on behalf of the regular user
            const result: Promise<void> = configRoomDAO.set(createdPart.partId, {
                ...ConfigRoomMocks.INITIAL,
                creator: createdPart.creator,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid a to use a fake name in the list of candidates', async() => {
            // Given a part with a configRoom, and a verified user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user joins the list of candidates with a fake name
            const result: Promise<void> = configRoomDAO.addCandidate(partId, { id: candidate.id, name: 'blibli' });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid a to add anyone else to the candidates', async() => {
            // Given a part with a configRoom, and two verified users
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const attackedCandidate: MinimalUser = await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await signOut();
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the user adds someone else to the list of candidates
            const result: Promise<void> = configRoomDAO.addCandidate(partId, attackedCandidate);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow to join the list of candidates', async() => {
            // Given a part with a configRoom, and a verified user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);

            // When the user joins to the list of candidates
            const result: Promise<void> = configRoomDAO.addCandidate(partId, candidate);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
            const matchingDocs: unknown[] = await configRoomDAO.subCollectionDAO(partId, 'candidates').findWhere([['id', '==', candidate.id]]);
            expect(matchingDocs.length).toBe(1);
        });
        it('should allow to join twice the list of candidates', async() => {
            // Given a part with a configRoom, and a verified user that is already candidate
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await createConnectedUser(CANDIDATE_EMAIL, CANDIDATE_NAME);
            await expectAsync(configRoomDAO.addCandidate(partId, candidate)).toBeResolvedTo();

            // When the user joins the list of candidates a second time
            // (for example, because they closed their tab and open it again)
            const result: Promise<void> = configRoomDAO.addCandidate(partId, candidate);

            // Then it should succeed
            // And there should be only one candidate document for the user
            await expectAsync(result).toBeResolvedTo();
            const matchingDocs: unknown[] = await configRoomDAO.subCollectionDAO(partId, 'candidates').findWhere([['id', '==', candidate.id]]);
            expect(matchingDocs.length).toBe(1);
        });
        it('should forbid to remove someone else from the candidates', async() => {
            // Given a part with a configRoom, with another user as candidate, and a malicious user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await addCandidate(partId);
            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious user tries to remove another candidate
            const result: Promise<void> = configRoomDAO.removeCandidate(partId, candidate);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid changing the fields of another candidate', async() => {
            // Given a part with a configRoom, with another user as candidate, and a malicious user
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await addCandidate(partId);

            await createConnectedUser(MALICIOUS_EMAIL, MALICIOUS_NAME);

            // When the malicious user tries to change another candidate's fields
            const update: Partial<MinimalUser> = { name: 'foo' };
            const result: Promise<void> = configRoomDAO.subCollectionDAO(partId, 'candidates').update(candidate.id, update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
    });
    describe('for creator', () => {
        it('should forbid setting a fake username as a creator', async() => {
            // Given a verified user and an existing part without a configRoom
            const createdPart: CreatedPart = await createPart();

            // When creating the corresponding configRoom, with the user as creator but with a fake username
            const fakeCreator: MinimalUser = { id: createdPart.creator.id, name: 'fake-jeanjaja' };
            const result: Promise<void> = configRoomDAO.set(createdPart.partId, {
                ...ConfigRoomMocks.INITIAL,
                creator: fakeCreator,
            });

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to join the list of candidates', async() => {
            // Given a part with a configRoom, with the current user being the creator
            const createdPart: CreatedPart = await createPart({ createConfigRoom: true });

            // When trying to join the list of candidates
            const result: Promise<void> = configRoomDAO.addCandidate(createdPart.partId, createdPart.creator);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should allow to remove someone else from the candidates', async() => {
            // Given a part with a configRoom, with another user as candidate
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await addCandidate(partId);
            await reconnectUser(CREATOR_EMAIL);

            // When creator tries to remove another candidate
            const result: Promise<void> = configRoomDAO.removeCandidate(partId, candidate);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should allow to change other fields than candidates and partStatus to STARTED', async() => {
            // Given a user that created a (non-started) part with a configRoom
            const partId: string = (await createPart({ createConfigRoom: true })).partId;

            const updates: Partial<ConfigRoom>[] = [
                { chosenOpponent: UserMocks.CANDIDATE_MINIMAL_USER },
                { partStatus: PartStatus.CONFIG_PROPOSED.value },
                { firstPlayer: FirstPlayer.CHOSEN_PLAYER.value },
                { partType: PartType.BLITZ.value },
                { maximalMoveDuration: 73 },
                { totalPartDuration: 1001001 },
            ];
            for (const update of updates) {
                // When modifying a field
                const result: Promise<void> = configRoomDAO.update(partId, update);

                // Then it should succeed
                await expectAsync(result).toBeResolvedTo();
            }
        });
        describe('on started part', () => {
            let partId: string;
            let creator: MinimalUser;
            beforeEach(async() => {
                // Given a part that is started

                // Creator creates the part and configRoom
                const createdPart: CreatedPart = await createPart({ createConfigRoom: true, signOut: true });
                partId = createdPart.partId;
                creator = createdPart.creator;

                // A candidate joins the candidates list
                const candidate: MinimalUser = await addCandidate(partId);

                // The creator then selects candidates as the chosen opponent and proposes the config
                await reconnectUser(CREATOR_EMAIL);
                const update: Partial<ConfigRoom> = {
                    chosenOpponent: candidate,
                    partStatus: PartStatus.CONFIG_PROPOSED.value,
                };
                await expectAsync(configRoomDAO.update(partId, update)).toBeResolvedTo();
                await signOut();

                // The chosen opponent then accepts the part
                await reconnectUser(CANDIDATE_EMAIL);
                const result: Promise<void> = configRoomDAO.update(partId, {
                    partStatus: PartStatus.PART_STARTED.value,
                });
                await expectAsync(result).toBeResolvedTo();

                // And we act as the creator
                await reconnectUser(CREATOR_EMAIL);
            });
            it('should forbid to change fields after part has started', async() => {
                const updates: Partial<ConfigRoom>[] = [
                    { creator },
                    { chosenOpponent: UserMocks.CANDIDATE_MINIMAL_USER },
                    { partStatus: PartStatus.CONFIG_PROPOSED.value },
                    { firstPlayer: FirstPlayer.CHOSEN_PLAYER.value },
                    { partType: PartType.BLITZ.value },
                    { maximalMoveDuration: 73 },
                    { totalPartDuration: 1001001 },
                ];
                for (const update of updates) {
                    // When modifying a field
                    const result: Promise<void> = configRoomDAO.update(partId, update);

                    // Then it should fail
                    await expectPermissionToBeDenied(result);
                }
            });
        });
    });
    describe('for non-chosen candidate', () => {
        it('should allow to leave the list of candidates', async() => {
            // Given a part with a configRoom, and a candidate
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const candidate: MinimalUser = await addCandidate(partId, false);

            // When the candidate leaves the list of candidates
            const result: Promise<void> = configRoomDAO.removeCandidate(partId, candidate);

            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid changing its own candidate fields', async() => {
            // Given a part with a configRoom, with a candidate
            const partId: string = (await createPart({ createConfigRoom: true, signOut: true })).partId;
            const malicious: MinimalUser = await addCandidate(partId);

            // When the malicious user tries to change one of its own candidate's fields
            const update: Partial<MinimalUser> = { name: 'foo' };
            const result: Promise<void> = configRoomDAO.subCollectionDAO(partId, 'candidates').update(malicious.id, update);

            // Then it should fail
            await expectPermissionToBeDenied(result);
        });
        it('should forbid to change fields', async() => {
            // Given a part with a configRoom, and a candidate
            const createdPart: CreatedPart = await createPart({ createConfigRoom: true, signOut: true });
            const partId: string = createdPart.partId;
            const creator: MinimalUser = createdPart.creator;
            const candidate: MinimalUser = await addCandidate(partId, false);

            const updates: Partial<ConfigRoom>[] = [
                { creator },
                { chosenOpponent: candidate },
                { partStatus: PartStatus.CONFIG_PROPOSED.value },
                { firstPlayer: FirstPlayer.CHOSEN_PLAYER.value },
                { partType: PartType.BLITZ.value },
                { maximalMoveDuration: 73 },
                { totalPartDuration: 1001001 },
            ];
            for (const update of updates) {
                // When modifying a field
                const result: Promise<void> = configRoomDAO.update(partId, update);

                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
    });
    describe('for chosen opponent', () => {
        let partId: string;
        beforeEach(async() => {
            // Given a configRoom where the current user is set as chosen opponent

            // We have to follow a realistic workflow to achieve that
            // The part and configRoom are first created
            partId = (await createPart({ createConfigRoom: true, signOut: true })).partId;

            // A candidate joins the candidates list
            const candidate: MinimalUser = await addCandidate(partId);

            // The creator then selects candidates as the chosen opponent and proposes the config
            await reconnectUser(CREATOR_EMAIL);
            const update: Partial<ConfigRoom> = {
                chosenOpponent: candidate,
                partStatus: PartStatus.CONFIG_PROPOSED.value,
            };
            await expectAsync(configRoomDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            // We will finally act as the chosen opponent
            await reconnectUser(CANDIDATE_EMAIL);
        });
        it('should allow to change status from PROPOSED to STARTED', async() => {
            // When the candidate accepts the config by setting partStatus
            const result: Promise<void> = configRoomDAO.update(partId, { partStatus: PartStatus.PART_STARTED.value });

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
                const result: Promise<void> = configRoomDAO.update(partId, { partStatus });

                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
        it('should forbid to change status if status is not PROPOSED', async() => {
            // And given that the part is not proposed
            await reconnectUser(CREATOR_EMAIL);
            const update: Partial<ConfigRoom> = { partStatus: PartStatus.PART_CREATED.value };
            await expectAsync(configRoomDAO.update(partId, update)).toBeResolvedTo();
            await signOut();

            await reconnectUser(CANDIDATE_EMAIL);

            const partStatusValues: number[] = [
                PartStatus.CONFIG_PROPOSED.value,
                PartStatus.PART_STARTED.value,
                PartStatus.PART_FINISHED.value,
            ];

            for (const partStatus of partStatusValues) {
                // When the candidate tries to set part status to any other value
                const result: Promise<void> = configRoomDAO.update(partId, { partStatus });

                // Then it should fail
                await expectPermissionToBeDenied(result);
            }
        });
    });
});
