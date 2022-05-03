/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Auth, signOut } from '@angular/fire/auth';
import { Part, MGPResult } from 'src/app/domain/Part';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import { expectFirebasePermissionDenied, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { PartDAO } from '../PartDAO';
import * as FireAuth from '@angular/fire/auth';
import { UserDAO } from '../UserDAO';

describe('PartDAO', () => {

    let partDAO: PartDAO;
    let userDAO: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        partDAO = TestBed.inject(PartDAO);
        userDAO = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(partDAO).toBeTruthy();
    });
    describe('observeActiveParts', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<Part> = new FirebaseCollectionObserver<Part>(
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
            playerZero: 'foo',
            turn: 0,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        const username: string = 'jeanjaja';
        beforeEach(async() => {
            // These tests need a logged in user to create documents
            await createConnectedGoogleUser(true);
        });
        it('should return true when user has an active part as player zero', async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerZero: username });
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(username);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return true when user has an active part as player one', async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerOne: username });
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(username);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return false when the user has no active part', async() => {
            // Given a part where the user is not active
            await partDAO.create(part);
            // When checking if the user has an active part
            const result: boolean = await partDAO.userHasActivePart(username);
            // Then it should return false
            expect(result).toBeFalse();

        });
        afterEach(async() => {
            await signOut(TestBed.inject(Auth));
        });
    });
    it('should allow a verified user to create a part', async() => {
        // Given a verified user
        await createConnectedGoogleUser(true, 'foo@bar.com', 'creator');
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
});
