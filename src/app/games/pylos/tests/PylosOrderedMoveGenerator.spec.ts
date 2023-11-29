/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosOrderedMoveGenerator } from '../PylosOrderedMoveGenerator';
import { PylosNode, PylosRules } from '../PylosRules';

describe('PylosOrderedMoveGenerator', () => {

    let moveGenerator: PylosOrderedMoveGenerator;
    const coord0: PylosCoord = new PylosCoord(0, 0, 0);
    const coord1: PylosCoord = new PylosCoord(0, 0, 1);
    const coord2: PylosCoord = new PylosCoord(0, 0, 2);

    beforeEach(() => {
        moveGenerator = new PylosOrderedMoveGenerator();
    });
    it('should generate 16 moves at first turn', () => {
        const initialNode: PylosNode = PylosRules.get().getInitialNode(MGPOptional.empty());
        const moves: PylosMove[] = moveGenerator.getListMoves(initialNode);
        expect(moves.length).toEqual(16);
    });
    describe('orderMoves', () => {
        it('should order move from lowest stone use to highest', () => {
            const moves: PylosMove[] = [
                PylosMove.ofClimb(coord0, coord1, [coord1]), // -1 stone used
                PylosMove.ofClimb(coord0, coord1, [coord1, coord2]), // -2 stone used
                PylosMove.ofClimb(coord0, coord1, []), // 0 stone used
                PylosMove.ofDrop(coord0, [coord0, coord1]), // -1 stone used
                PylosMove.ofDrop(coord0, []), // 1 stone used
                PylosMove.ofDrop(coord0, [coord1]), // 0 stone used
            ].sort(() => Math.random() - 0.5);

            const orderedMoves: PylosMove[] = moveGenerator['orderMoves'](moves);

            const expectedOrderedMoves: PylosMove[] = [
                PylosMove.ofClimb(coord0, coord1, [coord1, coord2]), // -2 stone used
                PylosMove.ofDrop(coord0, [coord0, coord1]), // -1 stone used
                PylosMove.ofClimb(coord0, coord1, [coord1]), // -1 stone used
                PylosMove.ofDrop(coord0, [coord1]), // 0 stone used
                PylosMove.ofClimb(coord0, coord1, []), // 0 stone used
                PylosMove.ofDrop(coord0, []), // 1 stone used
            ];

            expect(orderedMoves).toEqual(expectedOrderedMoves);
        });
    });
});
