import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AwaleComponent } from './awale.component';
import { AwaleMove } from 'src/app/games/awale/awale-move/AwaleMove';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { expectMoveFailure, expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Awale';
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
describe('AwaleComponent', () => {
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
        const gameComponent: AwaleComponent = wrapper.gameComponent as AwaleComponent;
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
    it('should create', async() => {
        expect(testElements.gameComponent).toBeTruthy();
    });
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            const moveSpy: jasmine.Spy = spyOn(AwaleMove, 'decode').and.callThrough();
            testElements.gameComponent.decodeMove(5);
            expect(moveSpy).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            const moveSpy: jasmine.Spy = spyOn(AwaleMove, 'encode').and.callThrough();
            testElements.gameComponent.encodeMove(new AwaleMove(1, 1));
            expect(moveSpy).toHaveBeenCalledTimes(1);
        });
    });
    it('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
        const board: number[][] = [
            [4, 4, 4, 4, 4, 2],
            [4, 4, 4, 4, 1, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();
        const expectations: MoveExpectations = {
            move: new AwaleMove(5, 0),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: 0,
            scoreOne: 0,
        };
        await expectMoveSuccess('#click_5_0', testElements, expectations);
        const awaleComponent: AwaleComponent = testElements.gameComponent as AwaleComponent;
        expect(awaleComponent.getCaseClasses(5, 0)).toBe('moved highlighted');
        expect(awaleComponent.getCaseClasses(5, 1)).toBe('moved');
        expect(awaleComponent.getCaseClasses(4, 1)).toBe('captured');
    }));
    it('should tell to user he can\'t move empty house', fakeAsync(async() => {
        const board: number[][] = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const slice: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();
        const expectations: MoveExpectations = {
            move: new AwaleMove(0, 0),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: 0,
            scoreOne: 0,
        };
        const message: string = 'You must choose a non-empty house to distribute.';
        await expectMoveFailure('#click_0_0', testElements, expectations, message);
    }));
});
