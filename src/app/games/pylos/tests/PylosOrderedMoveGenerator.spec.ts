/* eslint-disable max-lines-per-function */
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosOrderedMoveGenerator } from '../PylosOrderedMoveGenerator';
import { PylosNode, PylosRules } from '../PylosRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('PylosOrderedMoveGenerator', () => {

    let moveGenerator: PylosOrderedMoveGenerator;
    const defaultConfig: NoConfig = PylosRules.get().getDefaultRulesConfig();
    const coord0: PylosCoord = new PylosCoord(0, 0, 0);
    const coord1: PylosCoord = new PylosCoord(0, 0, 1);
    const coord2: PylosCoord = new PylosCoord(0, 0, 2);

    beforeEach(() => {
        moveGenerator = new PylosOrderedMoveGenerator();
    });

    it('should generate 16 moves at first turn', () => {
        const initialNode: PylosNode = PylosRules.get().getInitialNode(defaultConfig);
        const moves: PylosMove[] = moveGenerator.getListMoves(initialNode, defaultConfig);
        expect(moves.length).toEqual(16);
    });

    describe('orderMoves', () => {

        it('should order move from lowest piece use to highest', () => {
            const moves: PylosMove[] = [
                PylosMove.ofClimb(coord0, coord1, [coord1]), // -1 piece used
                PylosMove.ofClimb(coord0, coord1, [coord1, coord2]), // -2 piece used
                PylosMove.ofClimb(coord0, coord1, []), // 0 piece used
                PylosMove.ofDrop(coord0, [coord0, coord1]), // -1 piece used
                PylosMove.ofDrop(coord0, []), // 1 piece used
                PylosMove.ofDrop(coord0, [coord1]), // 0 piece used
            ].sort(() => Math.random() - 0.5);

            const orderedMoves: PylosMove[] = moveGenerator['orderMoves'](moves);

            const expectedOrderedMoves: PylosMove[] = [
                PylosMove.ofClimb(coord0, coord1, [coord1, coord2]), // -2 piece used
                PylosMove.ofDrop(coord0, [coord0, coord1]), // -1 piece used
                PylosMove.ofClimb(coord0, coord1, [coord1]), // -1 piece used
                PylosMove.ofDrop(coord0, [coord1]), // 0 piece used
                PylosMove.ofClimb(coord0, coord1, []), // 0 piece used
                PylosMove.ofDrop(coord0, []), // 1 piece used
            ];

            expect(orderedMoves).toEqual(expectedOrderedMoves);
        });

    });

});
