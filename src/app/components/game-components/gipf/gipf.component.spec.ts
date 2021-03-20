import { TestBed, tick, fakeAsync, ComponentFixture } from '@angular/core/testing';

import { Arrow, GipfComponent, GipfComponentFailure } from './gipf.component';
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
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { GipfFailure, GipfNode } from 'src/app/games/gipf/gipf-rules/GipfRules';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { By } from '@angular/platform-browser';
import { GipfBoard } from 'src/app/games/gipf/gipf-move/GipfBoard';


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
    function setupSlice(slice: GipfPartSlice): void {
        testElements.gameComponent.rules.node = new GipfNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
    }
    function expectToHaveFill(x: number, y: number, color: string): void {
        expect(getComponent().getCaseStyle(new Coord(x, y)).fill).toBe(color);
        const element: DebugElement = testElements.debugElement.query(By.css('#click_' + x + '_' + y));
        expect(element).toBeTruthy();
        // In a regexp, \s means any non-word character
        const regex: RegExp = new RegExp('\\sfill: ' + color + ';');
        expect(element.children[0].attributes.style).toMatch(regex);
    }
    function expectationFromMove(move: GipfMove): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
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
        expect(testElements.gameComponent).toBeTruthy('GipfComponent should be created');
    });
    it('should fail on selecting an invalid direction', fakeAsync(async() => {
        await expectClickSuccess('#click_3_6', testElements);
        await expectClickFail('#click_4_4', testElements, GipfFailure.INVALID_PLACEMENT_DIRECTION);
    }));
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()), [], []);
        await expectMoveSuccess('#click_0_4', testElements, expectationFromMove(move));
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        await expectClickFail('#click_3_3', testElements, GipfFailure.PLACEMENT_NOT_ON_BORDER);
    }));
    it('should show possible directions after selecting an occupied placement coord', fakeAsync(async() => {
        await expectClickSuccess('#click_6_3', testElements);
        expect(getComponent().arrows.length).toBe(3);
        expect(getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(5, 3));
        }));
        expect(getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(5, 4));
        }));
        expect(getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(6, 2));
        }));
    }));
    it('should not accept selecting something else than one of the proposed direction', fakeAsync(async() => {
        await expectClickSuccess('#click_6_3', testElements);
        await expectClickFail('#click_3_3', testElements, GipfComponentFailure.CLICK_FURTHER_THAN_ONE_COORD);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickFail('#click_6_3', testElements, GipfComponentFailure.NOT_PART_OF_CAPTURE);
    }));
    it('should highlight initial captures directly', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);

        expectToHaveFill(3, 2, getComponent().CAPTURED_FILL);
        expectToHaveFill(3, 3, getComponent().CAPTURED_FILL);
        expectToHaveFill(3, 4, getComponent().CAPTURED_FILL);
        expectToHaveFill(3, 5, getComponent().CAPTURED_FILL);
    }));
    it('should make pieces disappear upon selection of a capture', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);
        expect(getComponent().isPiece(new Coord(3, 2))).toBeFalse();
        expect(getComponent().isPiece(new Coord(3, 3))).toBeFalse();
        expect(getComponent().isPiece(new Coord(3, 4))).toBeFalse();
        expect(getComponent().isPiece(new Coord(3, 5))).toBeFalse();
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);
        await expectMoveSuccess('#click_0_4', testElements, expectationFromMove(move));
    }));
    it('should not allow capturing from a coord that is part of intersecting captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, B, B, B, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickFail('#click_2_3', testElements, GipfComponentFailure.AMBIGUOUS_CAPTURE_COORD);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        // Perform the placement to prepare for final capture
        await expectClickSuccess('#click_0_3', testElements);
        await expectClickSuccess('#click_1_3', testElements);
        await expectClickFail('#click_3_3', testElements, GipfComponentFailure.NOT_PART_OF_CAPTURE);
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_0_3', testElements);
        await expectClickSuccess('#click_1_3', testElements);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 3),
                                                              MGPOptional.of(HexaDirection.DOWN_RIGHT)),
                                            [],
                                            [new GipfCapture([
                                                new Coord(2, 3), new Coord(2, 4), new Coord(2, 5), new Coord(2, 6),
                                            ])]);

        await expectMoveSuccess('#click_2_3', testElements, expectationFromMove(move));
    }));
    it('should highlight moved pieces only', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, _, _, _, _],
            [_, B, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.UP_RIGHT));
        const move: GipfMove = new GipfMove(placement, [], []);
        await expectClickSuccess('#click_1_6', testElements);
        await expectMoveSuccess('#click_2_5', testElements, expectationFromMove(move));

        expect(getComponent().getCaseStyle(new Coord(1, 6)).fill).toEqual(getComponent().MOVED_FILL);
        expect(getComponent().getCaseStyle(new Coord(2, 5)).fill).toEqual(getComponent().MOVED_FILL);
        expect(getComponent().getCaseStyle(new Coord(3, 4)).fill).not.toEqual(getComponent().MOVED_FILL);
    }));
    it('should highlight capturable pieces', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        expect(getComponent().possibleCaptures).toContain(new GipfCapture([
            new Coord(3, 2),
            new Coord(3, 3),
            new Coord(3, 4),
            new Coord(3, 5),
        ]));
    }));
    it('should highlight captured pieces positions', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await expectMoveSuccess('#click_0_4', testElements, expectationFromMove(move));

        expectToHaveFill(3, 2, 'red');
        expectToHaveFill(3, 3, 'red');
        expectToHaveFill(3, 4, 'red');
        expectToHaveFill(3, 5, 'red');
    }));
    it('should update the number of pieces available', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await expectMoveSuccess('#click_0_4', testElements, expectationFromMove(move));

        expect(getComponent().getPlayerSidePieces(0).length).toBe(8);
        expect(getComponent().getPlayerSidePieces(1).length).toBe(5);
    }));
    it('should not accept placement on a complete line', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, B],
            [_, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, _],
            [_, _, B, _, _, _, _],
            [_, B, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_1_6', testElements);
        expect(getComponent().arrows.length).toBe(1);
        await expectClickFail('#click_2_5', testElements, GipfFailure.PLACEMENT_ON_COMPLETE_LINE);
    }));
    it('should accept moves with two initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(6, 3),
                                                              MGPOptional.empty()),
                                            [
                                                new GipfCapture([
                                                    new Coord(4, 4), new Coord(4, 3),
                                                    new Coord(4, 2), new Coord(4, 1),
                                                ]),
                                                new GipfCapture([
                                                    new Coord(2, 4), new Coord(2, 3),
                                                    new Coord(2, 2), new Coord(2, 1),
                                                ]),
                                            ], []);

        await expectClickSuccess('#click_4_4', testElements);
        await expectClickSuccess('#click_2_4', testElements);
        await expectMoveSuccess('#click_6_3', testElements, expectationFromMove(move));
    }));
    it('should accept moves with two final captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, _, A, B, A, A],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(5, 4),
                                                              MGPOptional.of(HexaDirection.UP_LEFT)),
                                            [],
                                            [
                                                new GipfCapture([
                                                    new Coord(4, 4), new Coord(4, 3),
                                                    new Coord(4, 2), new Coord(4, 1),
                                                ]),
                                                new GipfCapture([
                                                    new Coord(2, 4), new Coord(2, 3),
                                                    new Coord(2, 2), new Coord(2, 1),
                                                ]),
                                            ]);

        await expectClickSuccess('#click_5_4', testElements); // select placement coord
        await expectClickSuccess('#click_4_4', testElements); // select direction
        await expectClickSuccess('#click_4_4', testElements); // select first capture
        await expectMoveSuccess('#click_2_4', testElements, expectationFromMove(move)); // select second capture
    }));
    it('should remove highlights and arrows upon move cancellation', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);

        await expectClickSuccess('#click_3_3', testElements);
        await expectClickSuccess('#click_4_5', testElements);
        await expectClickSuccess('#click_4_4', testElements);
        await expectClickFail('#click_3_3', testElements, GipfComponentFailure.NOT_PART_OF_CAPTURE);

        expectToHaveFill(4, 5, getComponent().NORMAL_FILL);
        expectToHaveFill(3, 3, getComponent().NORMAL_FILL);
        expect(getComponent().arrows.length).toBe(0);
    }));
    it('should recompute captures upon intersecting captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, A, _, _, A],
            [_, _, _, A, _, _, A],
            [_, A, A, _, A, B, A],
            [_, _, _, A, _, _, A],
            [_, _, _, A, _, _, _],
            [A, A, A, B, B, _, _],
            [_, _, _, A, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [8, 4], [2, 3]);
        setupSlice(slice);

        const move: GipfMove = new GipfMove(
            new GipfPlacement(new Coord(3, 6), MGPOptional.of(HexaDirection.UP)),
            [new GipfCapture([
                new Coord(6, 0),
                new Coord(6, 1),
                new Coord(6, 2),
                new Coord(6, 3),
            ])],
            [
                new GipfCapture([
                    new Coord(0, 5),
                    new Coord(1, 5),
                    new Coord(2, 5),
                    new Coord(3, 5),
                    new Coord(4, 5),
                ]),
                new GipfCapture([
                    new Coord(3, 0),
                    new Coord(3, 1),
                    new Coord(3, 2),
                    new Coord(3, 3),
                    new Coord(3, 4),
                ]),
            ],
        );
        await expectClickSuccess('#click_6_0', testElements); // Initial capture
        await expectClickSuccess('#click_3_6', testElements); // Placement coord
        await expectClickSuccess('#click_3_5', testElements); // Placement direction
        await expectClickSuccess('#click_0_5', testElements); // Final capture 1
        await expectMoveSuccess('#click_3_0', testElements, expectationFromMove(move)); // Final capture 2
    }));
    it('should not allow selecting placement when no direction is valid', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, B],
            [_, _, _, _, _, A, _],
            [B, _, _, _, B, _, _],
            [A, _, _, A, _, _, _],
            [B, _, B, _, _, _, _],
            [A, A, _, _, _, _, _],
            [B, A, B, A, B, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        setupSlice(slice);
        await expectClickFail('#click_0_6', testElements, GipfComponentFailure.NO_DIRECTIONS_AVAILABLE);
    }));
});
