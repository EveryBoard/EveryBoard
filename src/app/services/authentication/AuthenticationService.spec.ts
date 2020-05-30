import { async } from '@angular/core/testing';

import { AuthenticationService } from './AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

const afAuth = {
    authState: of(null),
};
const afs = {
};
describe('AuthenticationService', () => {

    let service: AuthenticationService;

    beforeAll(() => {
        AuthenticationService.IN_TESTING = true;
        AuthenticationService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
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
        AuthenticationService.IN_TESTING = false;
    }));
});