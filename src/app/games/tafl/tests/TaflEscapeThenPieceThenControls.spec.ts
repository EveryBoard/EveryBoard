/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { BrandhubState } from '../brandhub/BrandhubState';
import { TaflEscapeThenPieceAndControlMinimax } from '../TaflEscapeThenPieceThenControlMinimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';

describe('TaflEscapeThenPieceAndControlMinimax', () => {

    let minimax: TaflEscapeThenPieceAndControlMinimax;

    let rules: BrandhubRules;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = BrandhubRules.get();
        rules.setInitialBoard();
        minimax = new TaflEscapeThenPieceAndControlMinimax(rules, 'TaflEscapeThenPieceAndControlMinimax');
    });
    it('should be better when king can escape than when he cannot', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const weakState: BrandhubState = new BrandhubState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, X, _, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const strongState: BrandhubState = new BrandhubState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
    it('should be better when king is one step away from winning than two', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const weakState: BrandhubState = new BrandhubState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, O, A, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, X, _, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const strongState: BrandhubState = new BrandhubState(strongBoard, 1);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ONE);
    });
});
