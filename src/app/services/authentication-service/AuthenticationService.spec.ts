import { async, TestBed } from '@angular/core/testing';

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
    afterAll(async(() => {
        service.ngOnDestroy();
    }));
});