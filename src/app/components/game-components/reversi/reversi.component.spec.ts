import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReversiComponent } from './reversi.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { ReversiNode } from 'src/app/games/reversi/reversi-rules/ReversiRules';
import { ReversiMove } from 'src/app/games/reversi/reversi-move/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { expectMoveSubmission, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Reversi';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('ReversiComponent', () => {

    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

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
        const fixture: ComponentFixture<LocalGameWrapperComponent> = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: ReversiComponent = wrapper.gameComponent as ReversiComponent;
        const cancelSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        testElements = { fixture, debugElement, gameComponent, cancelSpy, chooseMoveSpy };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('GoComponent should be created');
    });
    it('should show last move and captures', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, X, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, X, O, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, O, _, _, _, _],
        ];
        const initialSlice: ReversiPartSlice = new ReversiPartSlice(board, 0);
        testElements.gameComponent.rules.node = new ReversiNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        const expactions: MoveExpectations = {
            move: new ReversiMove(0, 4),
            slice: initialSlice,
            scoreZero: 2,
            scoreOne: 7,
        };
        await expectMoveSubmission('#click_0_4', testElements, expactions);

        const tablutGameComponent: ReversiComponent = <ReversiComponent> testElements.gameComponent;
        expect(tablutGameComponent.getRectFill(1, 3)).not.toEqual(tablutGameComponent.CAPTURED_FILL);
        expect(tablutGameComponent.getRectFill(2, 2)).not.toEqual(tablutGameComponent.CAPTURED_FILL);
        expect(tablutGameComponent.getRectFill(3, 1)).not.toEqual(tablutGameComponent.CAPTURED_FILL);
        expect(tablutGameComponent.getRectFill(4, 0)).not.toEqual(tablutGameComponent.CAPTURED_FILL);

        expect(tablutGameComponent.getRectFill(1, 4)).toEqual(tablutGameComponent.CAPTURED_FILL);

        expect(tablutGameComponent.getRectFill(1, 5)).toEqual(tablutGameComponent.CAPTURED_FILL);
        expect(tablutGameComponent.getRectFill(2, 6)).toEqual(tablutGameComponent.CAPTURED_FILL);

        expect(tablutGameComponent.getRectFill(0, 4)).toEqual(tablutGameComponent.MOVED_FILL);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(ReversiMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(ReversiMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new ReversiMove(1, 1));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
