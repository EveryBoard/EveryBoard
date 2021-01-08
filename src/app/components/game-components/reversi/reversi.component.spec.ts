import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReversiComponent } from './reversi.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { ReversiRules } from 'src/app/games/reversi/reversirules/ReversiRules';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { ReversiMove } from 'src/app/games/reversi/reversimove/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Reversi"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('ReversiComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: ReversiComponent;

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
        gameComponent = wrapper.gameComponent as ReversiComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("GoComponent should be created");
    });
    it('should accept simple move', async() => {
        const rules: ReversiRules = new ReversiRules(ReversiPartSlice);
        const listMoves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        const currentMove: ReversiMove = listMoves.getByIndex(0).key;
        expect((await gameComponent.onClick(currentMove.coord.x, currentMove.coord.y)).isSuccess()).toBeTrue();
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(ReversiMove, "decode").and.callThrough();
        gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(ReversiMove, "encode").and.callThrough();
        gameComponent.encodeMove(new ReversiMove(1, 1));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});