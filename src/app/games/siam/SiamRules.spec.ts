import { SiamRules } from './SiamRules';
import { SiamMove, SiamMoveNature } from './SiamMove';
import { SiamPiece } from './SiamPiece';

describe('SiamRules', () => {

    it('should be created', () => {
        const rules: SiamRules = new SiamRules();
        expect(rules).toBeTruthy();
    });
    it('Insertion should work', () => {
        const rules: SiamRules = new SiamRules();
        const moveIsLegal: boolean = rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeTruthy("Simple insertion at first turn should be legal");
        const foundPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        expect(foundPiece === SiamPiece.WHITE_RIGHT).toBeTruthy("Lower left corner should be occupied by a white piece going to the right, not "+foundPiece.toString());
    });
    it('Side pushing should work', () => {
        const rules: SiamRules = new SiamRules();
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        const moveIsLegal = rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        SiamRules.VERBOSE = true;
        expect(moveIsLegal).toBeTruthy("Side pushing should work");
        const foundPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const pushedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(pushedPiece === SiamPiece.WHITE_RIGHT).toBeTruthy("Pushed piece should have been moved up, instead we found "+pushedPiece.toString());
        expect(foundPiece === SiamPiece.BLACK_UP).toBeTruthy("Lower left corner should now be occupied by a black piece going up, not "+foundPiece.toString());
    });
    it('Rotation should work', () => {
        const rules: SiamRules = new SiamRules();
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
        const rules: SiamRules = new SiamRules();
        rules.choose(new SiamMove(-1, 4, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(0, 5, SiamMoveNature.FORWARD));
        rules.choose(new SiamMove(0, 3, SiamMoveNature.CLOCKWISE));
        const moveIsLegal: boolean = rules.choose(new SiamMove(0, 4, SiamMoveNature.FORWARD));
        expect(moveIsLegal).toBeFalsy("One vs one push should be illegal");
        const cornerPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[4][0]);
        const rotedPiece: SiamPiece = SiamPiece.decode(rules.node.gamePartSlice.board[3][0]);
        expect(rotedPiece === SiamPiece.WHITE_DOWN).toBeTruthy("Piece awaited there should have been white_down, instead found: "+rotedPiece.toString());
        expect(cornerPiece === SiamPiece.BLACK_UP).toBeTruthy("Piece trying to push there should have been black_up, instead found: "+cornerPiece.toString());
    });
    it('Two vs one push should work', () => {
        const rules: SiamRules = new SiamRules();
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
        const rules: SiamRules = new SiamRules();
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
});