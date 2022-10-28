/* eslint-disable max-lines-per-function */
import { SiamRules, SiamNode } from '../SiamRules';
import { SiamPiece } from '../SiamPiece';
import { SiamState } from '../SiamState';
import { SiamMove } from '../SiamMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { SiamMinimax } from '../../siam/SiamMinimax';
import { Table } from 'src/app/utils/ArrayUtils';

describe('SiamMinimax:', () => {

    let rules: SiamRules;
    let minimax: SiamMinimax;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;

    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const L: SiamPiece = SiamPiece.LIGHT_LEFT;
    const R: SiamPiece = SiamPiece.LIGHT_RIGHT;

    const u: SiamPiece = SiamPiece.DARK_UP;
    const l: SiamPiece = SiamPiece.DARK_LEFT;
    const r: SiamPiece = SiamPiece.DARK_RIGHT;
    const d: SiamPiece = SiamPiece.DARK_DOWN;

    beforeEach(() => {
        rules = SiamRules.get();
        minimax = new SiamMinimax(rules, 'SiamMinimax');
    });
    describe('list of moves', () => {
        it('should provide 44 possible moves on initial board', () => {
            // Given the initial board
            const node: SiamNode = new SiamNode(SiamState.getInitialState());
            // When computing the list of moves
            const firstTurnMoves: SiamMove[] = minimax.getListMoves(node);
            // Then there should be exactly 44 moves
            expect(firstTurnMoves.length).toEqual(44);
        });
        it('should compute all expected moves', () => {
            // Given a specific board
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [L, M, M, M, R],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            // When computing all moves
            const moves: SiamMove[] = minimax.getListMoves(node);
            // Then all expected moves are returned
            const moveType: { [moveTYpe: string]: number} = {
                moving: 0,
                rotation: 0,
                pushingInsertion: 0,
                slidingInsertion: 0,
            };
            for (const move of moves) {
                if (move.isInsertion()) {
                    if (move.landingOrientation === move.direction.get()) {
                        moveType.pushingInsertion = moveType.pushingInsertion + 1;
                    } else {
                        moveType.slidingInsertion = moveType.slidingInsertion + 1;
                    }
                } else if (move.isRotation()) {
                    moveType.rotation = moveType.rotation + 1;
                } else {
                    moveType.moving = moveType.moving + 1;
                }
            }
            expect(moveType).toEqual({ moving: 35, rotation: 12, pushingInsertion: 18, slidingInsertion: 16 });
        });
        it('should not propose inserting a piece when 5 pieces of the player are already on the board', () => {
            // Given a board with 5 pieces of the player
            const board: Table<SiamPiece> = [
                [d, _, _, d, _],
                [d, _, _, d, _],
                [_, M, M, U, _],
                [d, _, _, U, _],
                [_, _, _, M, _],
            ];
            const state: SiamState = new SiamState(board, 1);
            const node: SiamNode = new SiamNode(state);
            // When computing the moves
            const moves: SiamMove[] = minimax.getListMoves(node);
            for (const move of moves) {
                // Then no move should insert a new piece
                expect(move.isInsertion()).toBeFalse();
            }
        });
    });
    describe('best choices', () => {
        it('should choose victory immediately', () => {
            // Given a board where victory can be achieved
            const board: Table<SiamPiece> = [
                [_, U, _, M, _],
                [_, _, _, U, _],
                [_, M, M, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            // Then it should go for victory
            const bestMove: SiamMove = SiamMove.of(3, 1, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
            expect(chosenMove).toEqual(bestMove);
        });
        it('should consider pushing as the best option', () => {
            // Given a board where it is possible to push
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, M, M, U, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            // Then it should push
            const bestMove: SiamMove = SiamMove.of(3, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
            expect(chosenMove).toEqual(bestMove);
        });
        it('should consider pushing from outside to be the best option', () => {
            // Given a specific board
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [L, M, M, M, R],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            // When computing the best move
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            // Then the best move should push from outside
            const bestMove: SiamMove = SiamMove.of(3, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
            expect(chosenMove).toEqual(bestMove);
        });
    });
    describe('board value test', () => {
        it('should know who is closer to victory (with pieces of both players)', () => {
            // Given a board where both players have pieces but one is closer to victory
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, M, M, U, _],
                [_, _, u, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = SiamMove.of(3, 3, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
            // When computing the value of the board
            // Then it should consider player zero as closer to victory
            expect(minimax.getBoardValue(new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move))).value)
                .withContext('First player should be considered as closer to victory')
                .toBeLessThan(0);
        });
        it('should know who is closer to win (with pieces of a single player)', () => {
            // Given a board where only player zero has a piece
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, U, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = SiamMove.of(2, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
            // When computing the value of the board
            // Then it should consider player zero as closer to victory
            expect(minimax.getBoardValue(new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move))).value)
                .withContext('First player should be considered as closer to victory')
                .toBeLessThan(0);
        });
        it('should give the advantage to player of the current turn in case both are as close to push mountain off the edge', () => {
            // Given a board where both players are as close to victory than each other
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, L, M, _],
                [_, _, l, M, _],
                [_, _, _, M, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = SiamMove.of(1, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT).get();
            const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // When computing the board value
            // Then player zero should have a higher score because it is their turn
            expect(minimax.getBoardValue(node).value).toBeLessThan(0);
        });
        it('should assign same absolute value to states that only differ in turn', () => {
            // Given two states that only differ in their turn
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = SiamMove.of(1, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT).get();
            const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
            const boardValue: number = minimax.getBoardValue(node).value;

            const turnOneState: SiamState = new SiamState(board, 1);
            const turnOneNode: SiamNode = new SiamNode(turnOneState, MGPOptional.empty(), MGPOptional.of(move));
            const turnOneBoardValue: number = minimax.getBoardValue(turnOneNode).value;
            expect(turnOneBoardValue).withContext('Both board value should have same absolute value').toEqual(-1 * boardValue);
        });
    });
    describe('pushers computations', () => {
        it('should compute the expected pushers on first turn', () => {
            // Given the initial state
            const state: SiamState = SiamState.getInitialState();
            // When computing the pushers
            const pushers: { coord: Coord, distance: number }[] = SiamRules.get().getPushers(state, [1, 2, 3], [2]);
            // Then it should compute 6 pushers to a distance of 5
            expect(pushers.length).withContext('should find 6 pushers').toBe(6);
            for (const pusher of pushers) {
                expect(pusher.distance).withContext('should be at a distance of 5').toBe(5);
            }
        });
        it('should know how far a mountain is from the border and who is the closest pusher', () => {
            // Given a state
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, U, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            // When computing the closest pusher
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should identify the closest pusher and know the distance to the border
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 3),
            }));
        });
        it('should count rotation as +1 for pushing distance for neighor', () => {
            // Given a state with a piece that is a neighbor of a mountain
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, L, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should be at a distance of 3+1
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 3),
            }));
        });
        it('should not count rotation as +1 for pushing distance if not neighbor', () => {
            // Given a state with a piece that is not a neighbor to a mountain
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, L, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should be at a distance of 4
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 4),
            }));
        });
        it('should count outside pieces', () => {
            // Given a state without player pieces
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should be at distance 5, meaning it is a piece out of the board
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 5,
                coord: new Coord(3, 5),
            }));
        });
        it('should count outside pieces in force conflict', () => {
            // Given a board with a push of 2 vs. 2
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [_, M, M, M, _],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should be a piece outside of the board
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 5),
            }));
        });
        it('should not count outside pieces when all pieces are already on board', () => {
            // Given a board on which all pieces are
            const board: Table<SiamPiece> = [
                [d, _, _, _, R],
                [d, _, _, _, R],
                [d, M, M, M, R],
                [d, _, _, _, R],
                [d, _, _, _, R],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then there should be none
            expect(closestPusher).toEqual(MGPOptional.empty());
        });
        it('should not count out-numbered pusher', () => {
            // Given a board with aligned mountains
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, M, M, _],
                [_, _, _, M, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher for the aligned mountains
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then there should be none
            expect(closestPusher).toEqual(MGPOptional.empty());
        });
        it('should find furthest pusher when closest pusher is out-powered', () => {
            // Given a board where closest pusher is out-numbered
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, M, M, _],
                [_, _, _, M, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            // When computing the closest pusher
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then it should be the furthest
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 5),
            }));
        });
        it('should not be affected by post-mountain side pushed pieces', () => {
            // Given a board with a piece after the mountain and not aligned with the direction of interest
            const board: Table<SiamPiece> = [
                [_, _, _, r, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            // When computing the closest pusher
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            // Then the result shouldn't be affected by the piece after the mountain
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 4),
            }));
        });
        it('should not count unpushable mountains', () => {
            // Given a board with unpushable mountains, such as the initial board
            const state: SiamState = SiamState.getInitialState();
            // When computing the closest pusher horizontally
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.get().getLineClosestPusher(state, new Coord(4, 2), Orthogonal.RIGHT);
            // Then it should not find any
            expect(closestPusher).toEqual(MGPOptional.empty());
        });
    });
    it('should compute score from shortest distances correctly (for player zero)', () => {
        const currentPlayer: Player = Player.ZERO;
        const T: number = currentPlayer === Player.ZERO ? -1 : 1;
        const expectedValues: (number | null)[][] = [
        // 0:  won     1     2     3     4     5  nothing
            [null, null, null, null, null, null, null], // 1 has won
            [null, T, 55, 56, 57, 58, 59], // 1 has 1
            [null, -55, T, 46, 47, 48, 49], // 1 has 2
            [null, -56, -46, T, 37, 38, 39], // 1 has 3
            [null, -57, -47, -37, T, 28, 29], // 1 has 4
            [null, -58, -48, -38, -28, T, 19], // 1 has 5
            [null, -59, -49, -39, -29, -19, T], // 1 has nothing
        ];
        const actualValues: (number | null)[][] = [];
        for (let oneShortestDistance: number = 0; oneShortestDistance <= 6; oneShortestDistance++) {
            actualValues.push([]);
            for (let zeroShortestDistance: number = 0; zeroShortestDistance <= 6; zeroShortestDistance++) {
                if (oneShortestDistance === 0 ||
                    zeroShortestDistance === 0) {
                    actualValues[oneShortestDistance].push(null);
                } else {
                    const actualScore: number = SiamRules.get().getScoreFromShortestDistances(zeroShortestDistance,
                                                                                              oneShortestDistance,
                                                                                              currentPlayer);
                    actualValues[oneShortestDistance].push(actualScore);
                }
            }
        }
        expect(actualValues).toEqual(expectedValues);
    });
});
