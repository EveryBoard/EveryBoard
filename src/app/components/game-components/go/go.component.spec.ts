import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoComponent } from './go.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { GoMove } from 'src/app/games/go/go-move/GoMove';
import { expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { GoPartSlice, GoPiece, Phase } from 'src/app/games/go/go-part-slice/GoPartSlice';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Go';
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
describe('GoComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.BLACK;
    const X: GoPiece = GoPiece.WHITE;

    beforeAll(() => {
        GoComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GoComponent.VERBOSE;
        GoPartSlice.HEIGHT = 5;
        GoPartSlice.WIDTH = 5;
    });
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
        const gameComponent: GoComponent = wrapper.gameComponent as GoComponent;
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
        expect(testElements.gameComponent).toBeTruthy('GoComponent should be created');
    });
    it('Should allow to pass twice, then use "pass" as the method to "accept"', async() => {
        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue(); // Passed
        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue(); // Counting
        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue(); // Accept

        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue(); // Finished

        expect((await testElements.gameComponent.pass()).isSuccess()).toBeFalse();
    });
    it('Should show captures', fakeAsync(async() => {
        const board: Table<GoPiece> = [
            [O, X, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.fixture.detectChanges();

        const expectations: MoveExpectations = {
            move: new GoMove(0, 1),
            slice: slice,
            scoreZero: 0, scoreOne: 0,
        };
        await expectMoveSuccess('#click_0_1', testElements, expectations);
        const goComponent: GoComponent = testElements.gameComponent as GoComponent;
        expect(goComponent.captures).toEqual([new Coord(0, 0)]);
    }));
    it('Should allow simple clicks', fakeAsync(async() => {
        const firstExpectations: MoveExpectations = {
            move: new GoMove(1, 1),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: 0, scoreOne: 0,
        };
        await expectMoveSuccess('#click_1_1', testElements, firstExpectations);
        const secondExpectations: MoveExpectations = {
            move: new GoMove(2, 2),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: 0, scoreOne: 0,
        };
        await expectMoveSuccess('#click_2_2', testElements, secondExpectations);
    }));
    it('should delegate decoding to move', () => {
        spyOn(GoMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(5);
        expect(GoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(GoMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new GoMove(1, 1));
        expect(GoMove.encode).toHaveBeenCalledTimes(1);
    });
});
