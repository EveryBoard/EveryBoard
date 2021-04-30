import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { P4Component } from './p4.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { P4Rules } from 'src/app/games/p4/p4-rules/P4Rules';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { P4Move } from 'src/app/games/p4/P4Move';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'P4';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of(AuthenticationService.NOT_CONNECTED),

    getAuthenticatedUser: () => {
        return AuthenticationService.NOT_CONNECTED;
    },
};
describe('P4Component', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: P4Component;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
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
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('GoComponent should be created');
    });
    it('should accept simple move', async() => {
        const rules: P4Rules = new P4Rules(P4PartSlice);
        const listMoves: MGPMap<P4Move, P4PartSlice> = rules.getListMoves(rules.node);
        const currentMove: P4Move = listMoves.getByIndex(0).key;
        expect((await gameComponent.onClick(currentMove.x)).isSuccess()).toBeTrue();
    });
    it('should delegate decoding to move', () => {
        spyOn(P4Move, 'decode').and.callThrough();
        gameComponent.decodeMove(5);
        expect(P4Move.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(P4Move, 'encode').and.callThrough();
        gameComponent.encodeMove(P4Move.of(5));
        expect(P4Move.encode).toHaveBeenCalledTimes(1);
    });
});
