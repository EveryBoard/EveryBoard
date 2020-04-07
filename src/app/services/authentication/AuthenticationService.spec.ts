import { async } from '@angular/core/testing';

import { AuthenticationService } from './AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

const afAuth = {
    authState: of(null),
};
const afs = {
};
describe('AuthenticationService', () => {

    let service: AuthenticationService;

    beforeEach(() => {
        service = new AuthenticationService(afAuth as AngularFireAuth, afs as AngularFirestore);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    it('user should be considered not logged at start', () => {
        expect(service.isUserLogged()).toBeFalsy();
    });
    afterAll(async(() => {
        service.ngOnDestroy();
    }));
});