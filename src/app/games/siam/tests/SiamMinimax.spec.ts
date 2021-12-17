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

    const U: SiamPiece = SiamPiece.WHITE_UP;
    const L: SiamPiece = SiamPiece.WHITE_LEFT;
    const R: SiamPiece = SiamPiece.WHITE_RIGHT;

    const u: SiamPiece = SiamPiece.BLACK_UP;
    const l: SiamPiece = SiamPiece.BLACK_LEFT;
    const r: SiamPiece = SiamPiece.BLACK_RIGHT;
    const d: SiamPiece = SiamPiece.BLACK_DOWN;

    beforeEach(() => {
        rules = new SiamRules(SiamState);
        minimax = new SiamMinimax(rules, 'SiamMinimax');
    });
    it('Should provide 44 first turn childs at turn 0', () => {
        const firstTurnMoves: SiamMove[] = minimax.getListMoves(rules.node);
        expect(firstTurnMoves.length).toEqual(44);
    });
    describe('Best choice test', () => {
        it('Should choose victory immediately', () => {
            const board: Table<SiamPiece> = [
                [_, U, _, M, _],
                [_, _, _, U, _],
                [_, M, M, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            const bestMove: SiamMove = new SiamMove(3, 1, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
        });
        it('Should consider pushing as the best option', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, M, M, U, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            const bestMove: SiamMove = new SiamMove(3, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
        });
        it('Pushing from outside should be considered the best option', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [L, M, M, M, R],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const node: SiamNode = new SiamNode(state);
            const moves: SiamMove[] = minimax.getListMoves(node);
            const moveType: { [moveTYpe: string]: number} = {
                moving: 0,
                rotation: 0,
                pushingInsertion: 0,
                slidingInsertion: 0,
            };
            for (const move of moves) {
                if (move.isInsertion()) {
                    if (move.landingOrientation === move.moveDirection.get()) {
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
            const chosenMove: SiamMove = node.findBestMove(1, minimax);
            const bestMove: SiamMove = new SiamMove(3, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(chosenMove).toEqual(bestMove);
            expect(moveType).toEqual({ moving: 35, rotation: 12, pushingInsertion: 18, slidingInsertion: 16 });
        });
        it('Inserting a piece when 5 player are on the board should not be an option', () => {
            const board: Table<SiamPiece> = [
                [d, _, _, d, _],
                [d, _, _, d, _],
                [_, M, M, U, _],
                [d, _, _, U, _],
                [_, _, _, M, _],
            ];
            const state: SiamState = new SiamState(board, 1);
            const node: SiamNode = new SiamNode(state);
            const moves: SiamMove[] = minimax.getListMoves(node);
            let isInsertionPossible: boolean = false;
            for (const move of moves) {
                if (move.isInsertion()) {
                    isInsertionPossible = true;
                    break;
                }
            }
            expect(isInsertionPossible).toBeFalse();
        });
    });
    describe('Board value test', () => {
        it('should know who is closer to win (1)', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, M, M, U, _],
                [_, _, u, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = new SiamMove(3, 3, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(minimax.getBoardValue(new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move))).value)
                .withContext('First player should be considered as closer to victory')
                .toBeLessThan(0);
        });
        it('should know who is closer to win (2)', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, U, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = new SiamMove(2, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
            expect(minimax.getBoardValue(new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move))).value)
                .withContext('First player should be considered as closer to victory')
                .toBeLessThan(0);
        });
        it(`At equal 'closestPusher' player who'se turn it is to play should have the advantage`, () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, L, M, _],
                [_, _, l, M, _],
                [_, _, _, M, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = new SiamMove(1, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
            const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
            expect(minimax.getBoardValue(node).value).toBeLessThan(0);
        });
        it('Symetry test', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const move: SiamMove = new SiamMove(1, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
            const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
            const boardValue: number = minimax.getBoardValue(node).value;

            const symetryState: SiamState = new SiamState(board, 1);
            const symmetryNode: SiamNode = new SiamNode(symetryState, MGPOptional.empty(), MGPOptional.of(move));
            const symetryBoardValue: number = minimax.getBoardValue(symmetryNode).value;
            expect(boardValue).withContext('Both board value should have same absolute value').toEqual(-1 * symetryBoardValue);
        });
    });
    describe('Logical test', () => {
        it('should get option for first turn', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const pushers: { coord: Coord, distance: number }[] =
                SiamRules.getPushers(state, [1, 2, 3], [2]);
            expect(pushers.length).withContext('should not include horizontal push').toBe(6);
            expect(pushers[0].distance).withContext('should all be to the same distance').toBe(5);
        });
        it('should know how far a mountain is from the border', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, U, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 3),
            }));
        });
        it('should count rotation as +1 for pushing distance if up-close', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, L, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 3),
            }));
        });
        it('should not count rotation as +1 for pushing distance if not up-close', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, L, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 4),
            }));
        });
        it('should count outside pieces', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 5,
                coord: new Coord(3, 5),
            }));
        });
        it('should count outside pieces in force conflict', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, d, _],
                [_, _, _, d, _],
                [_, M, M, M, _],
                [_, _, _, U, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 5),
            }));
        });
        it('when 5 player on board, no outside pusher cannot be counted', () => {
            const board: Table<SiamPiece> = [
                [d, _, _, _, R],
                [d, _, _, _, R],
                [d, M, M, M, R],
                [d, _, _, _, R],
                [d, _, _, _, R],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.empty());
        });
        it('when pusher is out-powered, pusher should not be counted', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, M, M, _],
                [_, _, _, M, _],
                [_, _, _, _, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.empty());
        });
        it('when closest pusher is out-powered, furthest pusher should be found', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, M, M, _],
                [_, _, _, M, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 3,
                coord: new Coord(3, 5),
            }));
        });
        it('Post-Mountain side pushed pieces should not affect distance calculation', () => {
            const board: Table<SiamPiece> = [
                [_, _, _, r, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, _, U, _],
            ];
            const state: SiamState = new SiamState(board, 0);
            const fallingCoord: Coord = new Coord(3, 0);
            const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
                SiamRules.getLineClosestPusher(state, fallingCoord, Orthogonal.UP);
            expect(closestPusher).toEqual(MGPOptional.of({
                distance: 4,
                coord: new Coord(3, 4),
            }));
        });
    });
    it('Should not count unpushable mountains', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const closestPusher: MGPOptional<{ distance: number, coord: Coord }> =
            SiamRules.getLineClosestPusher(state, new Coord(4, 2), Orthogonal.RIGHT);
        expect(closestPusher).toEqual(MGPOptional.empty());
    });
    it('Should getScoreFromShortestDistances (Player Zero) correctly', () => {
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
                    const actualScore: number = SiamRules.getScoreFromShortestDistances(zeroShortestDistance,
                                                                                        oneShortestDistance,
                                                                                        currentPlayer);
                    actualValues[oneShortestDistance].push(actualScore);
                }
            }
        }
        expect(actualValues).toEqual(expectedValues);
    });
});
