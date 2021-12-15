import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { TaflPawn } from '../TaflPawn';
import { TablutState } from '../tablut/TablutState';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { SandwichThreat } from '../../../jscaip/PieceThreat';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { TablutMove } from '../tablut/TablutMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('TablutPieceAndInfluenceMinimax', () => {

    let minimax: TaflPieceAndInfluenceMinimax;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        const rules: TablutRules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
        minimax = new TaflPieceAndInfluenceMinimax(rules, 'TablutPieceAndInfluenceMinimax');
    });
    it('Should be better of with more piece', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, A, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, A, O, _, X, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should be better of with more influence (at piece number equal)', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, _, A, _, O, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, O, _, _, A, _, _, O, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should be better of with non threatened piece (at piece number equal)', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, X, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, X, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should be better of with non threatened piece (at piece number equal) (opposite one)', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, O, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, _, O, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('Should be better of with more kill than influence', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, X, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const weakState: TablutState = new TablutState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [X, _, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const strongState: TablutState = new TablutState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    describe('isThreatened', () => {
        it('should now that empty thrones are threatening', () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 1))).toBeTrue();
        });
        it('should see threats coming straight', () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [O, _, _, _, A, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
        });
        it('should see threats coming sideways', () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, X, _, _, _, _, _],
                [O, _, _, _, A, _, _, _, _],
                [X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(0, 4))).toBeTrue();
        });
        it('should not consider king threatened by one piece only', () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [O, _, _, A, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(3, 4))).toBeFalse();
        });
        it(`should not consider neighbors opponent's threatened pieces as threatening`, () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _, _],
                [_, _, _, O, X, _, O, _, _],
                [_, _, X, X, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 1);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            const expectedMap: MGPMap<Coord, MGPSet<SandwichThreat>> = new MGPMap();
            const expectedThreats: SandwichThreat[] = [
                new SandwichThreat(new Coord(4, 3), new MGPSet([new Coord(2, 4)])),
                new SandwichThreat(new Coord(3, 4), new MGPSet([new Coord(4, 2)])),
            ];
            expectedMap.set(new Coord(3, 3), new MGPSet(expectedThreats));
            expect(filteredThreatMap.equals(expectedMap)).toBeTrue();
        });
        it(`should not consider "moving" opponent's threatened pieces as threatening`, () => {
            // Given a board were the passive player threaten (4, 3) with a "moving" threatened (6, 3)
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, X, _, _],
                [_, _, _, O, X, _, O, _, _],
                [_, _, _, X, A, _, _, X, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 1);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);

            // When checking the threat list
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);

            // Then (4, 3) should not be deemed threaten since (6, 3) could be killed
            expect(filteredThreatMap.containsKey(new Coord(4, 3))).toBeFalse();
        });
        it('should not consider ensandwiched pieces as threatened', () => {
            const board: Table<TaflPawn> = [
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _, _],
                [_, _, _, _, O, _, _, _, _],
                [_, _, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 0);
            const pieces: MGPMap<Player, MGPSet<Coord>> = minimax.getPiecesMap(state);
            const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.getThreatMap(state, pieces);
            const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = minimax.filterThreatMap(threatMap, state);
            expect(filteredThreatMap.containsKey(new Coord(4, 5))).toBeFalse();
        });
    });
    describe('Victory', () => {
        it('Should choose king escape, at depth 1 and more', () => {
            const board: Table<TaflPawn> = [
                [_, A, _, _, _, _, _, O, _],
                [_, O, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ];
            const state: TablutState = new TablutState(board, 1);
            const node: TablutNode = new TablutNode(state);
            const expectedMove: TablutMove = TablutMove.of(new Coord(1, 0), new Coord(0, 0));
            for (let depth: number = 1; depth < 4; depth++) {
                const chosenMove: TablutMove = node.findBestMove(depth, minimax);
                expect(chosenMove).toEqual(expectedMove);
            }
        });
    });
});
