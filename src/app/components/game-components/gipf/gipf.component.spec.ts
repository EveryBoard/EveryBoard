import { TestBed, tick, fakeAsync, ComponentFixture } from '@angular/core/testing';

import { GipfComponent } from './gipf.component';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { Coord } from 'src/app/jscaip/coord/Coord';
import {
    expectClickFail, expectClickSuccess, expectMoveSuccess,
    MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { GipfNode } from 'src/app/games/gipf/gipf-rules/GipfRules';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';


const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Gipf';
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
describe('GipfComponent', () => {
    const _: GipfPiece = GipfPiece.EMPTY;
    const A: GipfPiece = GipfPiece.PLAYER_ZERO;
    const B: GipfPiece = GipfPiece.PLAYER_ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    function getComponent(): GipfComponent {
        return testElements.gameComponent as GipfComponent;
    }

    beforeEach(fakeAsync(async() => {
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
        const gameComponent: GipfComponent = wrapper.gameComponent as GipfComponent;
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
        expect(testElements.gameComponent).toBeTruthy('GipfComponent should be created');
    });
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(-3, 1), MGPOptional.empty()), [], []);
        const expectation: MoveExpectations = {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#click_-3_1', testElements, expectation);
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        await expectClickFail('#click_0_0', testElements,
                              'Les pièces doivent être placée sur une case du bord du plateau');
    }));
    it('should show possible directions after selecting an occupied placement coord', fakeAsync(async() => {
        await expectClickSuccess('#click_3_0', testElements);
        expect(getComponent().getHighlightStyle(2, 0)) .toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
        expect(getComponent().getHighlightStyle(2, 1)).toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
        expect(getComponent().getHighlightStyle(3, -1)).toEqual(getComponent().CLICKABLE_HIGHLIGHT_STYLE);
    }));
    it('should not accept selecting something else than one of the proposed direction', fakeAsync(async() => {
        await expectClickSuccess('#click_3_0', testElements);
        await expectClickFail('#click_0_0', testElements,
                              `Veuillez sélectionner une destination à une distance de 1 de l'entrée`);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        const reason: string = `Cette case ne fait partie d'aucune capture`;
        await expectClickFail('#click_3_0', testElements, reason);
    }));
    it('should make pieces disappear upon selection of a capture', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_0', testElements);
        expect(getComponent().isPiece(0, -1)).toBeFalse();
        expect(getComponent().isPiece(0, 0)).toBeFalse();
        expect(getComponent().isPiece(0, 1)).toBeFalse();
        expect(getComponent().isPiece(0, 2)).toBeFalse();
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_0_0', testElements);
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(-3, 1), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(0, -1), new Coord(0, 0), new Coord(0, 1), new Coord(0, 2),
                                            ])], []);

        const expectation: MoveExpectations = {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#click_-3_1', testElements, expectation);
    }));
    it('should not allow capturing from a coord that is part of intersecting captures', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, B, B, B, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        const reason: string = `Cette case fait partie de deux captures possibles, veuillez en choisir une autre`;
        await expectClickFail('#click_-1_0', testElements, reason);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        // Perform the placement to prepare for final capture
        await expectClickSuccess('#click_-3_0', testElements);
        await expectClickSuccess('#click_-2_0', testElements);
        const reason: string = `Cette case ne fait partie d'aucune capture`;
        await expectClickFail('#click_0_0', testElements, reason);
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ], _, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_-3_0', testElements);
        await expectClickSuccess('#click_-2_0', testElements);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(-3, 0),
                                                              MGPOptional.of(HexaDirection.DOWN_RIGHT)),
                                            [],
                                            [new GipfCapture([
                                                new Coord(-1, 0), new Coord(-1, 1), new Coord(-1, 2), new Coord(-1, 3),
                                            ])]);

        const expectation: MoveExpectations = {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#click_-1_0', testElements, expectation);
    }));
    it('should update the number of pieces available upon placement');
    it('should update the number of pieces available upon capture');

});
