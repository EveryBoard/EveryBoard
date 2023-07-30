/* eslint-disable max-lines-per-function */
import { PylosCoord } from '../PylosCoord';
import { PylosMinimax } from '../PylosMinimax';
import { PylosMove } from '../PylosMove';
import { PylosOrderedMinimax } from '../PylosOrderedMinimax';
import { PylosState } from '../PylosState';
import { PylosNode, PylosRules } from '../PylosRules';

describe('PylosOrderedMinimax', () => {

    let minimax: PylosOrderedMinimax;
    const coord0: PylosCoord = new PylosCoord(0, 0, 0);
    const coord1: PylosCoord = new PylosCoord(0, 0, 1);
    const coord2: PylosCoord = new PylosCoord(0, 0, 2);

    beforeEach(() => {
        const rules: PylosRules = PylosRules.get();
        minimax = new PylosOrderedMinimax(rules, 'PylosOrderMinimax');
    });
    it('should delegate getListMoves to PylosMinimax', () => {
        spyOn(PylosMinimax, 'getListMoves').and.callThrough();

        minimax.getListMoves(new PylosNode(PylosState.getInitialState()));

        expect(PylosMinimax.getListMoves).toHaveBeenCalledTimes(1);
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

            const orderedMoves: PylosMove[] = minimax.orderMoves(moves);

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
