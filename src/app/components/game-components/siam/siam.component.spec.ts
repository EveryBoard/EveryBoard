import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { SiamComponent } from './siam.component';
import { SiamMove } from 'src/app/games/siam/siam-move/SiamMove';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import {
    expectClickFail, expectClickSuccess, expectMoveSuccess,
    MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { SiamPiece } from 'src/app/games/siam/siam-piece/SiamPiece';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Siam';
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
describe('SiamComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;
    const U: number = SiamPiece.WHITE_UP.value;
    const u: number = SiamPiece.BLACK_UP.value;

    const expectMoveLegality: (move: SiamMove) => Promise<void> = async(move: SiamMove) => {
        const expectations: MoveExpectations = {
            move, scoreZero: null, scoreOne: null,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
        };
        if (move.isInsertion()) {
            await expectClickSuccess('#insertAt_' + move.coord.x + '_' + move.coord.y, testElements);
            const orientation: string = move.landingOrientation.toString();
            return expectMoveSuccess('#chooseOrientation_' + orientation, testElements, expectations);
        } else {
            await expectClickSuccess('#clickPiece_' + move.coord.x + '_' + move.coord.y, testElements);
            const direction: Orthogonal = move.moveDirection.getOrNull();
            const moveDirection: string = direction ? direction.toString() : '';
            await expectClickSuccess('#chooseDirection_' + moveDirection, testElements);
            const landingOrientation: string = move.landingOrientation.toString();
            return expectMoveSuccess('#chooseOrientation_' + landingOrientation, testElements, expectations);
        }
    };
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
        const gameComponent: SiamComponent = wrapper.gameComponent as SiamComponent;
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
        expect(testElements.gameComponent).toBeTruthy('SiamComponent should be created');
    });
    it('should accept insertion at first turn', fakeAsync(async() => {
        await expectClickSuccess('#insertAt_2_-1', testElements);
        const expectations: MoveExpectations = {
            move: new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#chooseOrientation_DOWN', testElements, expectations);
    }));
    it('Should not allow to move ennemy pieces', async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickFail('#clickPiece_4_4', testElements, 'Can\'t choose ennemy\'s pieces');
    });
    it('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
        const board: NumberTable = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#clickPiece_0_0', testElements);

        const reason: string = 'Can\'t insert when there is already a selected piece';
        await expectClickFail('#insertAt_-1_2', testElements, reason);
    }));
    it('should allow rotation', fakeAsync(async() => {
        const board: NumberTable = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        const move: SiamMove = new SiamMove(0, 0, MGPOptional.empty(), Orthogonal.DOWN);
        await expectMoveLegality(move);
    }));
    it('should allow normal move', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);
    }));
    it('should decide outing orientation automatically', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        testElements.gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
        testElements.fixture.detectChanges();

        await expectClickSuccess('#clickPiece_4_4', testElements);
        const expectations: MoveExpectations = {
            move: new SiamMove(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#chooseDirection_DOWN', testElements, expectations);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(269);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(SiamMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new SiamMove(2, 2, MGPOptional.empty(), Orthogonal.UP));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
