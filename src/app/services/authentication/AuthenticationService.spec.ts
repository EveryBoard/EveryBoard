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

    beforeAll(() => {
        AuthenticationService.IN_TESTING = true;
    });
    beforeEach(() => {
        service = new AuthenticationService(afAuth as AngularFireAuth, afs as AngularFirestore);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('user should be considered not logged at start', () => {
        expect(service.isUserLogged()).toBeFalse();
    });

    afterAll(() => {
        service.ngOnDestroy();
        AuthenticationService.IN_TESTING = false;
    });
});
