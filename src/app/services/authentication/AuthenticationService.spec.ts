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
        AuthenticationService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || AuthenticationService.VERBOSE;
    });
    beforeEach(() => {
        service = new AuthenticationService(afAuth as AngularFireAuth, afs as AngularFirestore);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('user should be considered not logged at start', () => {
        expect(service.isUserLogged()).toBeFalsy();
    });
    afterAll(() => {
        service.ngOnDestroy();
        AuthenticationService.IN_TESTING = false;
    });
});