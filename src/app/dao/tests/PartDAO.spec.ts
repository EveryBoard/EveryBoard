/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { IPart, MGPResult } from 'src/app/domain/icurrentpart';
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
            const callback: FirebaseCollectionObserver<IPart> = new FirebaseCollectionObserver<IPart>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActiveParts(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([['result', '==', MGPResult.UNACHIEVED.value]], callback);
        });
    });
    xdescribe('userHasActivePart', () => {
        const part: IPart = {
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
