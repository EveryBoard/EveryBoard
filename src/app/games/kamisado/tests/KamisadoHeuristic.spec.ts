/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoState } from '../KamisadoState';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { KamisadoHeuristic } from '../KamisadoHeuristic';
import { KamisadoColor } from '../KamisadoColor';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

const _: KamisadoPiece = KamisadoPiece.EMPTY;
const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;

describe('KamisadoHeuristic', () => {

    let heuristic: KamisadoHeuristic;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = KamisadoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new KamisadoHeuristic();
    });

    it('should assign board values based on positions', () => {
        // Given a board with one piece for each player, where zero is closer to its goal than one
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const node: KamisadoNode = new KamisadoNode(state);
        // When computing the board value
        // Then the score should be the advantage of zero over one
        expect(heuristic.getBoardValue(node, defaultConfig).value).toEqual(2);
    });

});
