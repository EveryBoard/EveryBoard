import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { assert } from 'src/app/utils/utils';

export class ApagosSquare {

    public static from(nbZero: number, nbOne: number, nbTotal: number): MGPFallible<ApagosSquare> {
        if (nbZero + nbOne > nbTotal) {
            return MGPFallible.failure('invalid starting case');
        }
        const containing: MGPMap<Player, number> = new MGPMap();
        containing.set(Player.ZERO, nbZero);
        containing.set(Player.ONE, nbOne);
        containing.set(Player.NONE, nbTotal);
        containing.makeImmutable();
        const validSquare: ApagosSquare = new ApagosSquare(containing);
        return MGPFallible.success(validSquare);
    }
    private constructor(private readonly containing: MGPMap<Player, number>)
    { }
    public isFull(): boolean {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(Player.NONE);
        return (nbZero + nbOne) >= nbTotal;
    }
    public count(player: Player): number {
        return this.containing.get(player).get();
    }
    public addPiece(piece: Player): ApagosSquare {
        assert(piece !== Player.NONE, 'should not call ApagosSquare.addPiece with Player.NONE');
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(Player.NONE);
        if (piece === Player.ZERO) {
            nbZero++;
        } else {
            nbOne++;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }
    public substractPiece(piece: Player): ApagosSquare {
        assert(piece !== Player.NONE, 'should not call ApagosSquare.addPiece with Player.NONE');
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(Player.NONE);
        if (piece === Player.ZERO) {
            nbZero--;
        } else {
            nbOne--;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }
    public getDominatingPlayer(): Player {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        if (nbZero > nbOne) return Player.ZERO;
        else if (nbOne > nbZero) return Player.ONE;
        return Player.NONE;
    }
    public equals(other: ApagosSquare): boolean {
        return this.containing.equals(other.containing);
    }
}
