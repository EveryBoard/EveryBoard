/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Auth, signOut } from '@angular/fire/auth';
import { Part, MGPResult } from 'src/app/domain/Part';
import { Player } from 'src/app/jscaip/Player';
import { createConnectedGoogleUser } from 'src/app/services/tests/ConnectedUserService.spec';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { PartDAO } from '../PartDAO';

describe('PartDAO', () => {

    let dao: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
