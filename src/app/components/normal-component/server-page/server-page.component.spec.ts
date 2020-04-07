import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerPageComponent } from './server-page.component';

import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { UserService } from 'src/app/services/user/UserService';
import { GameService } from 'src/app/services/game/GameService';

const userServiceStub = {
    getActivesUsersObs: () => of([]),
    unSubFromActivesUsersObs: () => {},
};
const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    unSubFromActivesPartsObs: () => { return; },
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
};
describe('ServerPageComponent', () => {

    let component: ServerPageComponent;

    let fixture: ComponentFixture<ServerPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule,
            ],
            providers: [
                { provide: UserService, useValue: userServiceStub },
                { provide: GameService, useValue: gameServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ServerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});