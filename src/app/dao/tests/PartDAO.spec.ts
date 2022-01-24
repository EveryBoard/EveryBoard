/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Part, MGPResult } from 'src/app/domain/Part';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { PartDAO } from '../PartDAO';
import firebase from 'firebase/app';
import 'firebase/auth';

describe('PartDAO', () => {

    let dao: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeActiveParts', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<Part> = new FirebaseCollectionObserver<Part>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActiveParts(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([['result', '==', MGPResult.UNACHIEVED.value]], callback);
        });
    });
    describe('updateAndBumpIndex', () => {
        it('Should delegate to update and bump index', async() => {
            // Given a PartDAO and an update to make to the part
            spyOn(dao, 'update').and.resolveTo();
            const update: Partial<Part> = {
                turn: 42,
            };

            // When calling updateAndBumpIndex
            await dao.updateAndBumpIndex('partId', Player.ZERO, 73, update);

            // Then update should have been called with lastUpdate infos added to it
            const expectedUpdate: Partial<Part> = {
                lastUpdate: {
                    index: 74,
                    player: Player.ZERO.value,
                },
                turn: 42,
            };
            expect(dao.update).toHaveBeenCalledOnceWith('partId', expectedUpdate);
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
            await createConnectedGoogleUser(false);
        });
        it('should return true when user has an active part as player zero', async() => {
            // Given a part where user is player zero
            await dao.create({ ...part, playerZero: username });
            // When checking if the user has an active part
            const result: boolean = await dao.userHasActivePart(username);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return true when user has an active part as player one', async() => {
            // Given a part where user is player zero
            await dao.create({ ...part, playerOne: username });
            // When checking if the user has an active part
            const result: boolean = await dao.userHasActivePart(username);
            // Then it should return true
            expect(result).toBeTrue();
        });
        it('should return false when the user has no active part', async() => {
            // Given a part where the user is not active
            await dao.create(part);
            // When checking if the user has an active part
            const result: boolean = await dao.userHasActivePart(username);
            // Then it should return false
            expect(result).toBeFalse();

        });
        afterEach(async() => {
            await firebase.auth().signOut();
        });
    });
});
