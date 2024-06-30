import { DiaballikBallPass, DiaballikMove, DiaballikSubMove, DiaballikTranslation, isTranslation } from '../DiaballikMove';
import { DiaballikFilteredMoveGenerator } from '../DiaballikFilteredMoveGenerator';
import { DiaballikNode, DiaballikRules } from '../DiaballikRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

function expectNoBackAndForth(move: DiaballikMove): void {
    const subMoves: DiaballikSubMove[] = move.getSubMoves();
    const translations: DiaballikSubMove[] = subMoves.filter(isTranslation);
    const startIsEnd: boolean = translations[0].getStart() === translations[1].getEnd();
    const endIsStart: boolean = translations[0].getEnd() === translations[1].getStart();
    expect(startIsEnd && endIsStart).toBeFalse();
}

function expectFinalMoveToBePasserTranslation(move: DiaballikMove): void {
    const subMoves: DiaballikSubMove[] = move.getSubMoves();
    if (subMoves[1] instanceof DiaballikBallPass) {
        const pass: DiaballikBallPass = subMoves[1];
        const translation: DiaballikTranslation = subMoves[2] as DiaballikTranslation;
        expect(translation.getStart()).toEqual(pass.getStart());
    }
}

function hasNSteps(n: number): (move: DiaballikMove) => boolean {
    return function(move: DiaballikMove): boolean {
        expect(move.getSubMoves().length).toBe(n);
        return move.getSubMoves().length === n;
    };
}

const defaultConfig: NoConfig = DiaballikRules.get().getDefaultRulesConfig();

describe('DiaballikFilteredMoveGenerator of length 3', () => {

    let moveGenerator: DiaballikFilteredMoveGenerator;

    beforeEach(() => {
        moveGenerator = new DiaballikFilteredMoveGenerator(3);
    });

    it('should have all 3-step move options at first turn', () => {
        // Given the initial node
        const node: DiaballikNode = new DiaballikNode(DiaballikRules.get().getInitialState());

        // When listing the moves
        const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should have all interesting move options, which is 138 moves
        expect(moves.length).toBe(138);
        // It should not contain A -> B, B -> A moves
        moves.forEach(expectNoBackAndForth);
        // It should only have translation after passes when the translated piece is the one that had the ball
        moves.forEach(expectFinalMoveToBePasserTranslation);
    });

});

describe('DiaballikFilteredMoveGenerator', () => {


    for (let moveLength: number = 1; moveLength <= 3; moveLength++) {
        it(`should have only the requested length moves (n = ${moveLength})`, () => {
            const moveGenerator: DiaballikFilteredMoveGenerator = new DiaballikFilteredMoveGenerator(moveLength);
            // Given a node
            const node: DiaballikNode = new DiaballikNode(DiaballikRules.get().getInitialState());

            // When listing the moves
            const moves: DiaballikMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then it should have only n-step moves
            expect(moves.every(hasNSteps(moveLength))).toBeTrue();
        });
    }
});
