/* eslint-disable max-lines-per-function */
import { EightDirection } from '../../../../jscaip/EightDirection';
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Table } from '../../../../jscaip/TableUtils';
import { RectangularBoardShape } from '../../../../jscaip/board-shape/rere';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { EightDirectionSquareTopology } from '../../../../jscaip/topology/EightDirectionSquareTopology';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { TopologicReversiRules, ReversiConfig, ReversiNode } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiState } from '../ReversiState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const ordinalTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
const squareShape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(8, 8, ordinalTopology);

describe('ReversiMoveGenerator', () => {

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
                const state: ReversiState<Direction> = new ReversiState(ordinalTopology, squareShape, gameState);
                const node: ReversiNode = new ReversiNode(state);
                const moves: ReversiMove[] = moveGenerator.getListMoves(node);
                expect(moves.length).toBe(1);
                expect(moves[0]).toBe(ReversiMove.PASS);
            });
        });

    }

});
