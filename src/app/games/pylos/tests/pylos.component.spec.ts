/* eslint-disable max-lines-per-function */
import { PylosComponent } from '../pylos.component';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PylosFailure } from '../PylosFailure';

describe('PylosComponent', () => {

    let componentTestUtils: ComponentTestUtils<PylosComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<PylosComponent>('Pylos');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should allow droping piece on occupable space', fakeAsync(async() => {
        // Given a board where a drop is possible

        // When clicking on it
        // Then the move should be accepted
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        await componentTestUtils.expectMoveSuccess('#drop_0_0_0', move);
    }));
    it('should forbid clicking on opponent piece', fakeAsync(async() => {
        // Given a board with opponent's pieces
        const initialBoard: PlayerOrNone[][][] = [
            [
                [X, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        //  When clicking on one
        // Then the move should be illegal
        await componentTestUtils.expectClickFailure('#piece_0_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async() => {
        // Given a board with an higher piece and lower space
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When choosing the higher piece
        await componentTestUtils.expectClickSuccess('#piece_0_0_1');

        // Then dropping lower should warn the user that it's illegal
        await componentTestUtils.expectClickFailure('#drop_2_2_0', PylosFailure.MUST_MOVE_UPWARD());
    }));
    describe('climbing', () => {
        it('should allow climbing', fakeAsync(async() => {
            // Given an board where climbing is possible
            const initialBoard: PlayerOrNone[][][] = [
                [
                    [O, X, _, _],
                    [X, O, _, _],
                    [_, _, _, _],
                    [_, _, _, O],
                ], [
                    [_, _, _],
                    [_, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ];
            const initialState: PylosState = new PylosState(initialBoard, 0);
            componentTestUtils.setupState(initialState);

            // When clicking the first piece then its landing place
            await componentTestUtils.expectClickSuccess('#piece_3_3_0');
            const move: PylosMove = PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), []);

            // Then the climb should be legal
            await componentTestUtils.expectMoveSuccess('#drop_0_0_1', move);
        }));
        it(`should show as 'left' climbing piece during the capture`, fakeAsync(async() => {
            // Given a board where by climbing you can make a capture
            const initialBoard: PlayerOrNone[][][] = [
                [
                    [O, X, O, _],
                    [X, O, X, _],
                    [X, X, X, _],
                    [_, _, _, O],
                ], [
                    [O, O, _],
                    [O, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ];
            const initialState: PylosState = new PylosState(initialBoard, 0);
            componentTestUtils.setupState(initialState);

            // When the climb is done, and the capture is awaited
            await componentTestUtils.expectClickSuccess('#piece_3_3_0');
            await componentTestUtils.expectClickSuccess('#drop_1_1_1');

            // Then the starting coord of the move should be 'left', and not 'selected'
            componentTestUtils.expectElementNotToExist('#piece_3_3_0');
            componentTestUtils.expectElementToHaveClass('#drop_3_3_0', 'moved');
            // And its landing coord should be visible and selected to indicate a capture is to be done
            componentTestUtils.expectElementToExist('#piece_1_1_1');
            componentTestUtils.expectElementToHaveClass('#piece_1_1_1', 'selected');
        }));
        it('should not allow a piece climbing on itself', fakeAsync(async() => {
            // Given a board where a piece could climb on itself then capture
            const initialBoard: PlayerOrNone[][][] = [
                [
                    [O, X, O, _],
                    [X, O, X, _],
                    [X, X, O, _],
                    [_, _, _, _],
                ], [
                    [O, O, _],
                    [O, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ];
            const initialState: PylosState = new PylosState(initialBoard, 0);
            componentTestUtils.setupState(initialState);

            // When selecting the piece and making it climg on itsef
            await componentTestUtils.expectClickSuccess('#piece_2_2_0');
            // Then landing on itself should not even be suggested
            componentTestUtils.expectElementNotToExist('#drop_1_1_1');
        }));
    });
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async() => {
        // Given a board where capture is possible
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When dropping the piece allowing the capture then clicking twice on this piece
        await componentTestUtils.expectClickSuccess('#drop_1_1_0'); // drop
        await componentTestUtils.expectClickSuccess('#piece_1_1_0'); // capture
        const expectedClasses: string[] = ['base', 'player0', 'selected', 'pre-captured'];
        componentTestUtils.expectElementToHaveClasses('#piece_1_1_0', expectedClasses);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(1, 1, 0)]);

        // Then clicking a second time on this piece should confirm the single capture move
        await componentTestUtils.expectMoveSuccess('#piece_1_1_0', move); // confirm single capture
    }));
    it('should allow captured two pieces, and show capture during move and after', fakeAsync(async() => {
        // Given a board where a capture can be done
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When dropping the piece allowing you to capture
        await componentTestUtils.expectClickSuccess('#drop_1_1_0');

        // Then capturing two piece should be possible
        await componentTestUtils.expectClickSuccess('#piece_0_0_0');
        componentTestUtils.expectElementToHaveClasses('#piece_0_0_0', ['base', 'player0', 'pre-captured']);

        // and When clicking on the second capture
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)];
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), captures);
        await componentTestUtils.expectMoveSuccess('#piece_0_1_0', move);

        // Then the two captures should be displayed as captured
        componentTestUtils.expectElementToHaveClass('#drop_0_0_0', 'captured');
        componentTestUtils.expectElementToHaveClass('#drop_0_1_0', 'captured');
    }));
    it('should show disappeared square when it has been captured, even if no longer landable', fakeAsync(async() => {
        // Given a board where a capture is possible
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, _, _],
                [X, O, O, _],
                [_, O, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When dropping a piece then clicking on two piece to capture
        await componentTestUtils.expectClickSuccess('#drop_2_2_0');
        await componentTestUtils.expectClickSuccess('#piece_0_0_1');
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 1), new PylosCoord(1, 1, 0)];
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 0), captures);
        await componentTestUtils.expectMoveSuccess('#piece_1_1_0', move);

        // Then the non longer landable square should be displayed
        componentTestUtils.expectElementToExist('#highCapture_0_0_1');
    }));
    it('should cancel move when clicking on a supporting piece', fakeAsync(async() => {
        // Given a board where there is supporting piece
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, _, _],
                [X, O, O, _],
                [_, O, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When clicking on the supporting piece
        // Then the move should be cancelled
        await componentTestUtils.expectClickFailure('#piece_0_0_0', PylosFailure.CANNOT_MOVE_SUPPORTING_PIECE());
    }));
    it('should cancel move (during capture) when clicking on a non capturable piece', fakeAsync(async() => {
        // Given a board where a capture is ongoing
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, O, _],
                [X, X, O, _],
                [X, X, X, _],
                [_, _, _, O],
            ], [
                [O, O, _],
                [O, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);
        await componentTestUtils.expectClickSuccess('#piece_3_3_0');
        await componentTestUtils.expectClickSuccess('#drop_1_1_1');

        // When clicking on a non capturable piece
        // Then the move should be illegal
        await componentTestUtils.expectClickFailure('#piece_2_1_0', PylosFailure.CANNOT_MOVE_SUPPORTING_PIECE());
    }));
    it('should allow capturing piece supporting captured-piece', fakeAsync(async() => {
        // Given a board where a piece has been captured, so now the piece previously supporting it are now capturable
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, O, _],
                [X, X, O, _],
                [X, X, X, _],
                [_, _, _, O],
            ], [
                [O, O, _],
                [O, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);
        await componentTestUtils.expectClickSuccess('#piece_3_3_0');
        await componentTestUtils.expectClickSuccess('#drop_1_1_1');
        await componentTestUtils.expectClickSuccess('#piece_0_0_1');

        // When clicking on the newly capturable piece
        // Then the move should be legal
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 1), new PylosCoord(0, 0, 0)];
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(1, 1, 1), captures);
        await componentTestUtils.expectMoveSuccess('#piece_0_0_0', move);
    }));
    it('should no longer show drop during capture phase', fakeAsync(async() => {
        // Given a board where a capture is about to be possible
        const initialBoard: PlayerOrNone[][][] = [
            [
                [O, X, O, _],
                [X, X, O, _],
                [X, X, X, O],
                [_, _, X, O],
            ], [
                [O, O, _],
                [O, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        // When passing in capture phase
        await componentTestUtils.expectClickSuccess('#drop_1_1_1');

        // Then the landing coord should disappear
        componentTestUtils.expectElementNotToExist('#drop_0_0_2');
        componentTestUtils.expectElementNotToExist('#drop_2_2_1');
    }));
});
