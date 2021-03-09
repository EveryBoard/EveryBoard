import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DvonnComponent } from './dvonn.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { DvonnPiece } from 'src/app/games/dvonn/DvonnPiece';
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { expectClickSuccess, expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Dvonn';
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
describe('DvonnComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const __ : number = DvonnPieceStack.EMPTY.getValue();
    const D1 : number = DvonnPieceStack.SOURCE.getValue();
    const W1: number = DvonnPieceStack.PLAYER_ZERO.getValue();
    const WW : number = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO, DvonnPiece.PLAYER_ZERO]).getValue();

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
        const gameComponent: DvonnComponent = wrapper.gameComponent as DvonnComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onValidUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onValidUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onValidUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('DvonnComponent should be created');
    });
    it('should not allow to pass initially', async() => {
        expect((await testElements.gameComponent.pass()).isFailure()).toBeTrue();
    });
    it('should allow valid moves', fakeAsync(async() => {
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        expect((await gameComponent.onClick(2, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onClick(2, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onClick(1, 1)).isSuccess()).toBeTrue();
        expect((await gameComponent.onClick(2, 1)).isSuccess()).toBeTrue();
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
    }));
    it('should allow to pass if stuck position', async() => {
        const board: number[][] = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __]];
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        expect(testElements.gameComponent.canPass).toBeTrue();
        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue();
    });
    it('should disallow moving from an invalid location', async() => {
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        expect((await gameComponent.onClick(0, 0)).isSuccess()).toBeFalse();
    });
    it('should disallow moving to invalid location', async() => {
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        expect((await gameComponent.onClick(2, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onClick(1, 0)).isSuccess()).toBeFalse();
    });
    it('should disallow choosing an incorrect piece', async() => {
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        expect((await gameComponent.onClick(1, 1)).isSuccess()).toBeFalse();
        // select black piece (but white plays first)
    });
    it('should disallow choosing a piece at end of the game', async() => {
        const board: number[][] = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __]];
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        expect((await testElements.gameComponent.pass()).isSuccess()).toBeTrue();
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        expect((await gameComponent.onClick(2, 0)).isSuccess()).toBeFalse();
    });
    it('should show disconnection/captures precisely', fakeAsync(async() => {
        // given board with ready disconnection
        const board: number[][] = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D1, W1, W1, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __]];
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);

        // When doing that disconnection
        await expectClickSuccess('#click_3_1', testElements);
        const expectations: MoveExpectations = {
            slice,
            move: DvonnMove.of(new Coord(3, 1), new Coord(2, 1)),
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#click_2_1', testElements, expectations);
        const gameComponent: DvonnComponent = testElements.gameComponent as DvonnComponent;
        // expect board to show it
        expect(gameComponent.disconnecteds).toEqual([
            { x: 4, y: 1, caseContent: W1 },
        ]);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(DvonnMove, 'decode').and.callThrough();
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        const encoded: number = testElements.gameComponent.encodeMove(move);
        testElements.gameComponent.decodeMove(encoded);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(DvonnMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(DvonnMove.of(new Coord(2, 0), new Coord(2, 1)));
        expect(DvonnMove.encode).toHaveBeenCalledTimes(1);
    });
});

