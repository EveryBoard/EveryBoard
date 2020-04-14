import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { of } from 'rxjs';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';
import { UserService } from 'src/app/services/user/UserService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { P4Component } from '../p4/p4.component';
import { IJoinerId } from 'src/app/domain/ijoiner';

const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    stopObserving: () => { return; }
};
const userServiceStub = {
    getActivesUsersObs: () => of([]),
};
const joinerServiceStub = {
    joinGame: () => {
        return new Promise(resolve => { resolve(); });
    },
    stopObserving: () => {},
    startObserving: (jId: string, cb: (iJ: IJoinerId) => void) => {},
    cancelJoining: () => {
        return new Promise(resolve => { resolve(); });
    },
    setChosenPlayer: (pseudo: String) => {
        return new Promise(resolve => { resolve(); });
    }
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: true}; },
};
describe('OnlineGameWrapperComponent', () => {

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    let component: OnlineGameWrapperComponent;

    let contained: P4Component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
            ],
            declarations: [
                OnlineGameWrapperComponent,
            ],
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
        const compiled = fixture.debugElement.nativeElement;
        const partCreationComponent = compiled.querySelector("app-part-creation");
        const gameIncluderComponent = compiled.querySelector("app-game-includer")
        expect(partCreationComponent).toBeTruthy("app-part-creation tag should be present at start");
        expect(gameIncluderComponent).toBeNull("app-game-includer tag should be absent at start");
    });
    afterAll(() => {
        component.ngOnDestroy();
    });
});