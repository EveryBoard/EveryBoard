import { DiaballikBallPass, DiaballikMove, DiaballikSubMove, DiaballikTranslation } from '../DiaballikMove';
import { DiaballikFilteredMoveGenerator } from '../DiaballikFilteredMoveGenerator';
import { DiaballikNode } from '../DiaballikRules';
import { DiaballikState } from '../DiaballikState';

describe('DiaballikFilteredMoveGenerator', () => {

    let moveGenerator: DiaballikFilteredMoveGenerator;

    beforeEach(() => {
        moveGenerator = new DiaballikFilteredMoveGenerator();
    });
    it('should have only 3 step moves', () => {
        // Given a node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have only 3-step moves
        function has3Steps(move: DiaballikMove): boolean {
            return move.getSubMoves().length === 3;
        }
        expect(moves.every(has3Steps)).toBeTrue();
    });
    it('should have all 3-step move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikState.getInitialState());

        // When computing the list of moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node);

        // Then it should have all interesting move options, which is 368 moves
        expect(moves.length).toBe(136);
        // It should not contain A -> B, B -> A moves
        function expectNoBackAndForth(move: DiaballikMove): void {
            const translations: DiaballikSubMove[] =
                move.getSubMoves().filter((subMove: DiaballikSubMove) => subMove instanceof DiaballikTranslation);
            const startIsEnd: boolean = translations[0].getStart() === translations[1].getEnd();
            const endIsStart: boolean = translations[0].getEnd() === translations[1].getStart();
            expect(startIsEnd && endIsStart).toBeFalse();
        }
        moves.forEach(expectNoBackAndForth);
        // It should only have translation after passes when the translated piece is the one that had the ball
        function expectTranslatedPieceAfterPass(move: DiaballikMove): void {
            const subMoves: DiaballikSubMove[] = move.getSubMoves();
            if (subMoves[1] instanceof DiaballikBallPass) {
                const pass: DiaballikBallPass = subMoves[1];
                const translation: DiaballikTranslation = subMoves[2] as DiaballikTranslation;
                expect(translation.getStart()).toEqual(pass.getStart());
            }
        }
        moves.forEach(expectTranslatedPieceAfterPass);
    });
});
