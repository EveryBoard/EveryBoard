import { SiamRules } from './SiamRules';
import { SiamMove, SiamMoveNature } from '../siammove/SiamMove';
import { SiamPiece } from '../SiamPiece';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { SiamPartSlice } from '../SiamPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('SiamRules', () => {

    let rules: SiamRules;

    beforeAll(() => {
        SiamRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SiamRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new SiamRules();
    });
    it('SiamRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('SiamRules should provide 20 first turn childs at turn 0', () => {
        const firstTurnMoves: MGPMap<SiamMove, SiamPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(20);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('Insertion should work', () => {
        const moveIsLegal: boolean = rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeTruthy("Simple insertion at first turn should be legal");
        const foundPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        expect(foundPiece === SiamPiece.WHITE_RIGHT).toBeTruthy("Lower left corner should be occupied by a white piece going to the right, not "+foundPiece.toString());
        expect(rules.node.gamePartSlice.turn).toBe(1, "After one legal move, turn should be 1");
    });
    it('Simple forwarding should work', () => {
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 5, SiamMoveNature.FORWARD));
        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 4, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeTruthy("Simple forward at second turn should be legal");
        const previousPieceLocation: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        expect(previousPieceLocation === SiamPiece.EMPTY).toBeTruthy("Lower left corner should be unoccupied after move, not " + previousPieceLocation.toString());
        const newPieceLocation: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][1]);
        expect(newPieceLocation === SiamPiece.WHITE_RIGHT).toBeTruthy("Lower left corner should be unoccupied after move, not " + previousPieceLocation.toString());
    });
    it('Side pushing should work', () => {
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        const moveIsLegal = rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeTruthy("Side pushing should work");
        const foundPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const pushedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(pushedPiece === SiamPiece.WHITE_RIGHT).toBeTruthy("Pushed piece should have been moved up, instead we found "+pushedPiece.toString());
        expect(foundPiece === SiamPiece.BLACK_UP).toBeTruthy("Lower left corner should now be occupied by a black piece going up, not "+foundPiece.toString());
    });
    it('Rotation should work', () => {
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 3, SiamMoveNature.CLOCKWISE));
        expect(moveIsLegal).toBeTruthy("Rotation should be legal");
        const cornerPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const rotedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(rotedPiece === SiamPiece.WHITE_DOWN).toBeTruthy("Rotated piece should have rotated as a white piece going down, instead we found "+rotedPiece.toString());
        expect(cornerPiece === SiamPiece.BLACK_UP).toBeTruthy("Lower left corner should now be occupied by a black piece going up, not "+cornerPiece.toString());
    });
    it('One vs one push should not work', () => {
        expect(rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD))).toBeTruthy(0);
        expect(rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD))).toBeTruthy(1);
        expect(rules.choose(new SiamMove(0, 3, SiamMoveNature.CLOCKWISE))).toBeTruthy(2);

        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 4, SiamMoveNature.FORWARD));

        expect(moveIsLegal).toBeFalsy("One vs one push should be illegal");
        const cornerPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const rotedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(rotedPiece === SiamPiece.WHITE_DOWN).toBeTruthy("Piece awaited there should have been white_down, instead found: "+rotedPiece.toString());
        expect(cornerPiece === SiamPiece.BLACK_UP).toBeTruthy("Piece trying to push there should have been black_up, instead found: "+cornerPiece.toString());
    });
    it('One vs one push should not work even if one of the involved is at the border', () => {
        expect(rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD))).toBeTruthy(0);
        expect(rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD))).toBeTruthy(1);
        expect(rules.choose(new SiamMove(0, 3, SiamMoveNature.CLOCKWISE))).toBeTruthy(2);
        expect(rules.choose(new SiamMove(4, 5, SiamMoveNature.FORWARD))).toBeTruthy(3);

        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 3, SiamMoveNature.FORWARD));

        expect(moveIsLegal).toBeFalsy("One vs one push should be illegal, even if one of the involved isat the border");
        const cornerPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const rotedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(rotedPiece === SiamPiece.WHITE_DOWN).toBeTruthy("Piece awaited there should have been white_down, instead found: "+rotedPiece.toString());
        expect(cornerPiece === SiamPiece.BLACK_UP).toBeTruthy("Piece trying to push there should have been black_up, instead found: "+cornerPiece.toString());
    });
    it('Two vs one push should work', () => {
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(0, 3, SiamMoveNature.CLOCKWISE));
        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeTruthy("Two vs one push should be legal");
        const pushedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[2][0]);
        const alliedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        const pushingPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0])
        expect(pushedPiece === SiamPiece.WHITE_DOWN).toBeTruthy("Pushed piece should have been WHITE_DOWN, instead found : "+pushedPiece.toString());
        expect(alliedPiece === SiamPiece.BLACK_UP).toBeTruthy("Allied piece should have been BLACK_UP, instead found: "+alliedPiece.toString());
        expect(pushingPiece === SiamPiece.BLACK_UP).toBeTruthy("Pushing piece should have been BLACK_UP, instead found: "+pushingPiece.toString());
    });
    it('6 insertion should be impossible', () => {
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 5, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(-1, 3, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 4, SiamMoveNature.CLOCKWISE));
        rules.choose(new SiamMove(-1, 2, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 4, SiamMoveNature.CLOCKWISE));
        rules.choose(new SiamMove(-1, 1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 4, SiamMoveNature.CLOCKWISE));
        rules.choose(new SiamMove(-1, 0, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, 4, SiamMoveNature.CLOCKWISE));
        const moveIsLegal: boolean = rules.choose(new SiamMove(-1, 0, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeFalsy("6th insertion should be illegal");
    });
    it('Pushing several mountains should be illegal', () => {
        rules.choose(new SiamMove(-1, 2, SiamMoveNature.FORWARD));
        const moveIsLegal: boolean = rules.choose(new SiamMove(-1, 2, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(-1, 2, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeFalsy();
    });
    it('Player 0 pushing player 0 pushing mountain should be a victory for player 0', () => {
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        expect(rules.node.ownValue).toEqual(Number.MIN_SAFE_INTEGER, "Player 0 should have won (min score)");
    });
    it('Player 1 pushing player 0 pushing mountain should be a victory for player 0', () => {
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(4, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(2, -1, SiamMoveNature.FORWARD));
        expect(rules.node.ownValue).toEqual(Number.MIN_SAFE_INTEGER, "Player 0 should have won (min score)");
    });
});