/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { QuebecCastlesDrop, QuebecCastlesMove } from '../QuebecCastlesMove';
import { QuebecCastlesMoveGenerator } from '../QuebecCastlesMoveGenerator';
import { QuebecCastlesConfig, QuebecCastlesNode, QuebecCastlesRules } from '../QuebecCastlesRules';
import { QuebecCastlesState } from '../QuebecCastlesState';
import { PlayerOrNone } from '../../../../app/jscaip/Player';
import { Coord } from '../../../../app/jscaip/Coord';
import { PlayerMap } from '../../../../app/jscaip/PlayerMap';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultCastles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
    MGPOptional.of(new Coord(8, 8)),
    MGPOptional.of(new Coord(0, 0)),
);

describe('QuebecCastlesMoveGenerator', () => {

    let moveGenerator: QuebecCastlesMoveGenerator;
    const defaultConfig: MGPOptional<QuebecCastlesConfig> = QuebecCastlesRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new QuebecCastlesMoveGenerator();
    });

    it('should have all drop options at first turn', () => {
        // Given an initial node
        const initialState: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);
        const node: QuebecCastlesNode = new QuebecCastlesNode(initialState);

        // When listing the moves
        const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be this 1 choice by available space in territory
        expect(moves.length).toBe(15);
    });

    it('should have all drop options at second turn', () => {
        // Given an initial node
        const initialState: QuebecCastlesState =
            QuebecCastlesRules.get().getInitialState(defaultConfig).incrementTurn();
        const node: QuebecCastlesNode = new QuebecCastlesNode(initialState);

        // When listing the moves
        const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be one move by available space
        expect(moves.length).toBe(19);
    });

    describe('Drop phase', () => {

        describe('Custom Config', () => {

            describe('drop piece by piece', () => {

                it('should allow putting soldier in first turn', () => {
                    // Given a node in drop phase (hence a custom config)
                    const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                        ...defaultConfig.get(),
                        dropMode: 'PIECE_BY_PIECE',
                        defenders: 3,
                        invaders: 5,
                    });
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, _],
                        [_, _, _, _, _, _, _, _, _],
                    ], 1, defaultCastles);
                    const node: QuebecCastlesNode = new QuebecCastlesNode(state);

                    // When listing the moves
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then there should be this many moves
                    expect(moves.length).toBe(14);
                });

                it('should drop last pieces by batch (first player has less piece)', () => {
                    // Given a board in  piece-by-piece mode
                    const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                        ...defaultConfig.get(),
                        dropMode: 'PIECE_BY_PIECE',
                        defenders: 3,
                        invaders: 5,
                    });

                    // where current player is the last player with pieces to drop
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 5, defaultCastles);
                    const node: QuebecCastlesNode = new QuebecCastlesNode(state);

                    // When listing the possible move of generator
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then it should only propose one move including all remaining drops
                    expect(moves.length).toBe(1);
                    const move: QuebecCastlesDrop = moves[0] as QuebecCastlesDrop;
                    expect(move.coords.size()).toEqual(3);
                });

                it('should drop last pieces by batch (first player has more pieces)', () => {
                    // Given a board in  piece-by-piece mode where first player has more pieces
                    const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                        ...defaultConfig.get(),
                        dropMode: 'PIECE_BY_PIECE',
                        defenders: 5,
                        invaders: 3,
                    });
                    // where current player is the last player with pieces to drop
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, X, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, O, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 6, defaultCastles);
                    const node: QuebecCastlesNode = new QuebecCastlesNode(state);

                    // When listing the possible move of generator
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then it should only propose one move including all remaining drops
                    expect(moves.length).toBe(1);
                    const move: QuebecCastlesDrop = moves[0] as QuebecCastlesDrop;
                    expect(move.coords.size()).toEqual(2);
                });

            });

            describe('drop piece by piece & place castle', () => {

                const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...defaultConfig.get(),
                    dropMode: 'PIECE_BY_PIECE',
                    playersPlaceCastle: true,
                    defenders: 3,
                    invaders: 5,
                });

                it('should drop last pieces by batch (invader has more piece)', () => {
                    // Given a board in  piece-by-piece mode where invader has more piece
                    // and where you must place castle yourself
                    // where current player is the last player with pieces to drop
                    const state: QuebecCastlesState = new QuebecCastlesState([
                        [_, _, _, _, _, _, _, _, _],
                        [X, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, _],
                        [_, _, _, _, _, _, _, _, O],
                        [_, _, _, _, _, _, _, O, _],
                    ], 5, defaultCastles);
                    const node: QuebecCastlesNode = new QuebecCastlesNode(state);

                    // When listing the possible move of generator
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then it should only propose piece drop
                    expect(moves.every((move: QuebecCastlesDrop) => move.coords.size() === 1)).toBeTrue();
                });

            });

            describe('drop by batch', () => {

                it('should drop like default config does', () => {
                    // Given a first turn in drop-by-batch config
                    const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                        ...defaultConfig.get(),
                        dropMode: 'BY_BATCH',
                        defenders: 3,
                        invaders: 5,
                    });
                    const node: QuebecCastlesNode = QuebecCastlesRules.get().getInitialNode(customConfig);

                    // When listing the moves
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then there should be only one move, dropping 3 pieces
                    expect(moves.length).toBe(1);
                    const coords: Coord[] = [new Coord(7, 8), new Coord(8, 7), new Coord(7, 7)];
                    const expectedMove: QuebecCastlesMove = QuebecCastlesMove.drop(coords);
                    expect(moves[0]).toEqual(expectedMove);
                });

                it('should drop king first when required', () => {
                    // Given a first turn when you need to place the castle
                    const customConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                        ...defaultConfig.get(),
                        dropMode: 'BY_BATCH',
                        playersPlaceCastle: true,
                        defenders: 3,
                        invaders: 5,
                    });
                    const node: QuebecCastlesNode = QuebecCastlesRules.get().getInitialNode(customConfig);

                    // When listing the moves
                    const moves: QuebecCastlesMove[] = moveGenerator.getListMoves(node, customConfig);

                    // Then there should be single drops
                    expect(moves.every((v: QuebecCastlesDrop) => v.coords.size() === 1)).toBeTrue();
                });

            });

        });

    });

});
