import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { BrandhubState } from '../brandhub/BrandhubState';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';

describe('TaflPieceAndControlHeuristic', () => {

    let heuristic: TaflPieceAndControlHeuristic<BrandhubMove, BrandhubState>;

    let rules: BrandhubRules;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = BrandhubRules.get();
        heuristic = new TaflPieceAndControlHeuristic(rules);
    });
    it('should prefer to be threatened by false threat than by real one', () => {
        // Given a board where you are threatened by an uncapturable piece
        // here, X is threatened for real (and each player have 1 threat)
        const weakBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [O, X, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, A, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const weakState: BrandhubState = new BrandhubState(weakBoard, 1);

        // And a board where what threatens you is a threatened piece
        // (and each player has 1 threat)
        const strongBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [O, X, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, O, _, _, A, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const strongState: BrandhubState = new BrandhubState(strongBoard, 1);

        // Then the strong board should be preferred
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
    });
});
