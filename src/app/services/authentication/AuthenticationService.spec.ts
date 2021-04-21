import { AuthenticationService } from './AuthenticationService';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

const afAuth: unknown = {
    authState: of(null),
};
const afs: unknown = {
};
describe('AuthenticationService', () => {
    let service: AuthenticationService;

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
    });
});
