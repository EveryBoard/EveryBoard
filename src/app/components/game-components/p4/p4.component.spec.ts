import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { P4Component } from './p4.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { P4Rules } from 'src/app/games/p4/p4rules/P4Rules';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { MoveX } from 'src/app/jscaip/MoveX';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "P4"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('P4Component', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: P4Component;

    beforeAll(() => {
        P4Component.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || P4Component.VERBOSE;
    });
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as P4Component;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("GoComponent should be created");
    });
    it('should accept simple move', async() => {
        const rules: P4Rules = new P4Rules(P4PartSlice);
        const listMoves: MGPMap<MoveX, P4PartSlice> = rules.getListMoves(rules.node);
        const currentMove: MoveX = listMoves.getByIndex(0).key;
        expect((await gameComponent.onClick(currentMove.x)).isSuccess()).toBeTrue();
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(MoveX, "decode").and.callThrough();
        gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(MoveX, "encode").and.callThrough();
        gameComponent.encodeMove(MoveX.get(5));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});