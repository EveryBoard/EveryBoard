import { MGPOptional } from 'src/app/utils/MGPOptional';
import { DiaballikBallPass, DiaballikMove, DiaballikTranslation } from '../DiaballikMove';
import { DiaballikMoveGenerator, DiaballikMoveInConstruction } from '../DiaballikMoveGenerator';
import { DiaballikNode } from '../DiaballikRules';
import { DiaballikState } from '../DiaballikState';
import { Coord } from 'src/app/jscaip/Coord';

describe('DiaballikMoveInConstruction', () => {

    it('should return empty when extracting a pass end of a move without pass', () => {
        // Given a move without pass
        const move: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], DiaballikState.getInitialState(), DiaballikState.getInitialState());
        // When extracting the pass end
        const passEnd: MGPOptional<Coord> = move.getPassEnd();
        // Then it should be empty
        expect(passEnd.isAbsent()).toBeTrue();
    });
    it('should return empty when extracting the previous translation of a move without translation', () => {
        // Given a move without translation
        const move: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], DiaballikState.getInitialState(), DiaballikState.getInitialState());
        // When extracting the previous translation
        const previousTranslation: MGPOptional<DiaballikTranslation> = move.getPreviousTranslation();
        // Then it should be empty
        expect(previousTranslation.isAbsent()).toBeTrue();
    });
    it('should detect coordinates that are part of a pass', () => {
        // Given a move with a pass
        const pass: DiaballikBallPass = DiaballikBallPass.from(new Coord(0, 0), new Coord(3, 0)).get();
        const move: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([pass], DiaballikState.getInitialState(), DiaballikState.getInitialState());
        // When checking a coord that is part of its path pass
        const isInPass: boolean = move.passPathContains(new Coord(2, 0));
        // Then it should be true
        expect(isInPass).toBeFalse();
    });
    it('should not consider a coord part of a pass if there is no pass', () => {
        // Given a move without pass
        const move: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], DiaballikState.getInitialState(), DiaballikState.getInitialState());
        // When checking whether a coord is part of its path pass
        const isInPass: boolean = move.passPathContains(new Coord(0, 0));
        // Then it should be false
        expect(isInPass).toBeFalse();
    });
});

describe('DiaballikMoveGenerator', () => {

    let moveGenerator: DiaballikMoveGenerator;

    function numberOfSubMovesIs(n: number): (move: DiaballikMove) => boolean {
        return (move: DiaballikMove): boolean => move.getSubMoves().length === n;
    }

    beforeEach(() => {
        moveGenerator = new DiaballikMoveGenerator();
    });
    it('should have all move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have all move options containing 1-step moves (8 exactly, 6 translations and 2 passes),
        // 2-steps, and 3-steps move
        expect(moves.filter(numberOfSubMovesIs(1)).length).toBe(8);
        expect(moves.filter(numberOfSubMovesIs(2)).length).toBe(68);
        expect(moves.filter(numberOfSubMovesIs(3)).length).toBe(138);
        expect(moves.length).toBe(8 + 68 + 138);
    });
});
