/* eslint-disable max-lines-per-function */
import { MGPFallible, MGPOptional, Set } from '@everyboard/lib';
import { DiaballikBallPass, DiaballikMove, DiaballikSubMove, DiaballikTranslation } from '../DiaballikMove';
import { DiaballikMoveGenerator, DiaballikMoveInConstruction } from '../DiaballikMoveGenerator';
import { DiaballikNode, DiaballikRules } from '../DiaballikRules';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';
import { Coord } from 'src/app/jscaip/Coord';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('DiaballikMoveInConstruction', () => {

    it('should return empty when extracting a pass end of a move without pass', () => {
        // Given a move without pass
        const state: DiaballikState = DiaballikRules.get().getInitialState();
        const move: DiaballikMoveInConstruction = new DiaballikMoveInConstruction([], state, state);

        // When extracting the pass end
        const passEnd: MGPOptional<Coord> = move.getPassEnd();

        // Then it should be empty
        expect(passEnd.isAbsent()).toBeTrue();
    });

    it('should return empty when extracting the previous translation of a move without translation', () => {
        // Given a move without translation
        const state: DiaballikState = DiaballikRules.get().getInitialState();
        const move: DiaballikMoveInConstruction = new DiaballikMoveInConstruction([], state, state);

        // When extracting the previous translation
        const previousTranslation: MGPOptional<DiaballikTranslation> = move.getPreviousTranslation();

        // Then it should be empty
        expect(previousTranslation.isAbsent()).toBeTrue();
    });

    it('should detect coordinates that are part of a pass', () => {
        // Given a move with a pass
        const state: DiaballikState = DiaballikRules.get().getInitialState();
        const pass: DiaballikBallPass = DiaballikBallPass.from(new Coord(0, 0), new Coord(3, 0)).get();
        const move: DiaballikMoveInConstruction = new DiaballikMoveInConstruction([pass], state, state);

        // When checking a coord that is part of its path pass
        const isInPass: boolean = move.passPathContains(new Coord(2, 0));

        // Then it should be true
        expect(isInPass).toBeTrue();
    });

    it('should not consider a coord part of a pass if there is no pass', () => {
        // Given a move without pass
        const state: DiaballikState = DiaballikRules.get().getInitialState();
        const move: DiaballikMoveInConstruction = new DiaballikMoveInConstruction([], state, state);

        // When checking whether a coord is part of its path pass
        const isInPass: boolean = move.passPathContains(new Coord(0, 0));

        // Then it should be false
        expect(isInPass).toBeFalse();
    });

    it('should filter duplicates when put in a set', () => {
        // Given two equal moves
        const firstTranslation: DiaballikSubMove = DiaballikTranslation.from(new Coord(0, 0), new Coord(0, 1)).get();
        const secondTranslation: DiaballikSubMove = DiaballikTranslation.from(new Coord(1, 0), new Coord(1, 1)).get();
        const state: DiaballikState = DiaballikRules.get().getInitialState();
        const move: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([firstTranslation, secondTranslation], state, state);
        const equalMove: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([firstTranslation, secondTranslation], state, state);

        // When putting them in a set
        const set: Set<DiaballikMoveInConstruction> = new Set([move, equalMove]);

        // Then there should be only one move
        expect(set.size()).toBe(1);
    });

});

function numberOfSubMovesIs(n: number): (move: DiaballikMove) => boolean {
    return (move: DiaballikMove): boolean => move.getSubMoves().length === n;
}
const defaultConfig: NoConfig = DiaballikRules.get().getDefaultRulesConfig();

describe('DiaballikMoveGenerator', () => {

    let moveGenerator: DiaballikMoveGenerator;

    const O: DiaballikPiece = DiaballikPiece.ZERO;
    const X: DiaballikPiece = DiaballikPiece.ONE;
    const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
    const _: DiaballikPiece = DiaballikPiece.NONE;

    function expectToHaveOnlyOneTranslationPair(moves: DiaballikMove[],
                                                firstTranslation: DiaballikTranslation,
                                                secondTranslation: DiaballikTranslation): void
    {
        const firstOrder: DiaballikMove =
            new DiaballikMove(firstTranslation, MGPOptional.of(secondTranslation), MGPOptional.empty());
        const secondOrder: DiaballikMove =
            new DiaballikMove(secondTranslation, MGPOptional.of(firstTranslation), MGPOptional.empty());
        const firstIsPresent: boolean = moves.some((m: DiaballikMove) => m.equals(firstOrder));
        const secondIsPresent: boolean = moves.some((m: DiaballikMove) => m.equals(secondOrder));
        // Only one of them can be true. Here, !== is xor on booleans
        expect(firstIsPresent).not.toEqual(secondIsPresent);
    }

    beforeEach(() => {
        moveGenerator = new DiaballikMoveGenerator();
    });

    it('should have all move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikRules.get().getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should have all move options containing 1-step moves (8 exactly, 6 translations and 2 passes),
        // 2-steps, and 3-steps move
        expect(moves.filter(numberOfSubMovesIs(1)).length).toBe(8);
        expect(moves.filter(numberOfSubMovesIs(2)).length).toBe(45);
        expect(moves.filter(numberOfSubMovesIs(3)).length).toBe(80);
        expect(moves.length).toBe(8 + 45 + 80);
    });

    it('should yield one unique state per move at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikRules.get().getInitialState());

        // When computing the states resulting from the possible moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);
        function applyMove(move: DiaballikMove): DiaballikState {
            const legalityInfo: MGPFallible<DiaballikState> = DiaballikRules.get().isLegal(move, node.gameState);
            return DiaballikRules.get().applyLegalMove(move, node.gameState, defaultConfig, legalityInfo.get());
        }
        const states: DiaballikState[] = new Set(moves.map(applyMove)).toList();

        // Then we should have as many states as there are moves
        expect(states.length).toBe(moves.length);
    });

    it('should filter A->B B->A translations', () => {
        // Given a fictitious state with only one piece for Player.ZERO
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
        ], 0);
        const node: DiaballikNode = new DiaballikNode(state);

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should not have "no-op" translations
        // Here, possible moves include: 2 of length 1, 3 of length 2
        // 3 and not 4 because both "diagonal" moves are equivalent
        expect(moves.length).toBe(2+3);
        expect(moves.filter(numberOfSubMovesIs(1)).length).toBe(2);
        expect(moves.filter(numberOfSubMovesIs(2)).length).toBe(3);
    });

    it('should filter should keep either A->B;C->D or C->D;A->B', () => {
        // Given a state
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [_, _, O, O, _, _, _],
            [O, O, _, _, _, _, _],
        ], 0);
        const node: DiaballikNode = new DiaballikNode(state);

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should only have one of each 2-translation option
        // We look for some specific ones here: (0,6) -> (0,5) ; (1, 6) -> (1, 5)
        expectToHaveOnlyOneTranslationPair(moves,
                                           DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                                           DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get());
        expectToHaveOnlyOneTranslationPair(moves,
                                           DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                                           DiaballikTranslation.from(new Coord(2, 5), new Coord(2, 4)).get());
    });

});

describe('DiaballikMoveGenerator (not avoiding duplicates)', () => {

    let moveGenerator: DiaballikMoveGenerator;

    beforeEach(() => {
        moveGenerator = new DiaballikMoveGenerator(false);
    });

    it('should have at least all move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikRules.get().getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should have all move options containing 1-step moves (8 exactly, 6 translations and 2 passes),
        // 2-steps, and 3-steps move
        expect(moves.filter(numberOfSubMovesIs(1)).length).toBe(8);
        expect(moves.filter(numberOfSubMovesIs(2)).length).toBeGreaterThanOrEqual(45);
        expect(moves.filter(numberOfSubMovesIs(3)).length).toBeGreaterThanOrEqual(80);
        expect(moves.length).toBeGreaterThanOrEqual(8 + 45 + 80);
    });

});
