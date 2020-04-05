import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { of } from 'rxjs';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { AuthenticationService } from 'src/app/services/authentication-service/AuthenticationService';
import { GameService } from 'src/app/services/GameService';
import { UserService } from 'src/app/services/UserService';
import { JoinerService } from 'src/app/services/JoinerService';

const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    stopObservingPart: () => { return; }
};
const userServiceStub = {
    getActivesUsersObs: () => of([]),
};
const joinerServiceStub = {

};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: true}; },
};
describe('OnlineGameWrapperComponent', () => {

    let component: OnlineGameWrapperComponent;

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
            ],
            declarations: [ OnlineGameWrapperComponent ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: GameService, useValue: gameServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: JoinerService, useValue: joinerServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});