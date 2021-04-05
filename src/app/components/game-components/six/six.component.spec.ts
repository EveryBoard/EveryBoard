import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { SixGameState } from 'src/app/games/six/six-game-state/SixGameState';
import { SixMove } from 'src/app/games/six/six-move/SixMove';
import { SixNode } from 'src/app/games/six/six-rules/SixRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { expectClickSuccess, expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { LocalGameWrapperComponent } from '../../wrapper-components/local-game-wrapper/local-game-wrapper.component';

import { SixComponent } from './six.component';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Six';
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
describe('SixComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    function getMoveExpectations(move: SixMove): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
    }
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
        const gameComponent: SixComponent = wrapper.gameComponent as SixComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onLegalUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onLegalUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onLegalUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('SixComponent should be created');
    });
    it('Should drop before 40th turn', fakeAsync(async() => {
        testElements.fixture.detectChanges();
        const move: SixMove = SixMove.fromDrop(new Coord(0, 2));
        const expectations: MoveExpectations = getMoveExpectations(move);
        await expectMoveSuccess('#neighboor_0_2', testElements, expectations);
    }));
    it('Should do deplacement after the 39th turn', fakeAsync(async() => {
        const board: NumberTable = [
            [O, X, O],
            [_, _, X],
            [_, O, _],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        testElements.gameComponent.rules.node = new SixNode(null, null, state, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#piece_0_0', testElements);
        const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(2, 2));
        const expectations: MoveExpectations = getMoveExpectations(move);
        await expectMoveSuccess('#neighboor_2_2', testElements, expectations);
    }));
    xit('Should ask to cut when needed', fakeAsync(async() => {
        const board: NumberTable = [
            [O, _, O],
            [X, _, O],
            [O, O, X],
            [X, _, _],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        testElements.gameComponent.rules.node = new SixNode(null, null, state, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#piece_1_2', testElements);
        await expectClickSuccess('#neighboor_2_3', testElements);
        const move: SixMove = SixMove.fromCuttingDeplacement(new Coord(1, 2), new Coord(2, 3), new Coord(2, 3));
        const expectations: MoveExpectations = getMoveExpectations(move);
        await expectMoveSuccess('#neighboor_2_3', testElements, expectations);
    }));
    it('Should highlight last left coord, landing coord, and disconnected coords');
    describe('victory', () => {
        it('should highlight winning line');
        it('should highlight winning triangle');
        it('should highlight winning hexagone');
    });
});
