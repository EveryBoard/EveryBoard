/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Ordinal } from '../../../../jscaip/Ordinal';
import { Table } from '../../../../jscaip/TableUtils';
import { RectangularShape } from '../../../../jscaip/shape/RectangularShape';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { OrdinalSquareTopology } from '../../../../jscaip/topology/OrdinalSquareTopology';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { TopologicReversiRules, ReversiConfig, ReversiNode } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiState } from '../ReversiState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const ordinalTopology: OrdinalSquareTopology = new OrdinalSquareTopology();
const squareShape: RectangularShape<Ordinal> = new RectangularShape(8, 8, ordinalTopology);

fdescribe('ReversiMoveGenerator', () => {

    let moveGenerator: ReversiMoveGenerator;
    let defaultConfig: ReversiConfig;

    const rules: TopologicReversiRules[] = [
        ReversiRules.get(),
        ToricReversiRules.get(),
    ];

    for (const rule of rules) {

        describe('for ' + rule.constructor.name, () => {

            beforeEach(() => {
                defaultConfig = rule.getDefaultRulesConfig();
                moveGenerator = new ReversiMoveGenerator(rule);
            });

            it('should have 4 choices at first turn', () => {
                const node: ReversiNode = rule.getInitialNode(defaultConfig);
                const moves: ReversiMove[] = moveGenerator.getListMoves(node);
                expect(moves.length).toBe(4);
            });

            it('should propose passing move when no other moves are possible', () => {
                const board: Table<FourStatePiece> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                ];
                const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
                const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
                const node: ReversiNode = new ReversiNode(state);
                const moves: ReversiMove[] = moveGenerator.getListMoves(node);
                expect(moves.length).toBe(1);
                expect(moves[0]).toBe(ReversiMove.PASS);
            });
        });

    }

});
