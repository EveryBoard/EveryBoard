import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { assert } from 'src/app/utils/assert';

export class ApagosSquare {

    public static from(nbZero: number, nbOne: number, nbTotal: number): MGPFallible<ApagosSquare> {
        if (nbZero + nbOne > nbTotal) {
            return MGPFallible.failure('invalid starting space');
        }
        const containing: MGPMap<PlayerOrNone, number> = new MGPMap();
        containing.set(Player.ZERO, nbZero);
        containing.set(Player.ONE, nbOne);
        containing.set(Player.NONE, nbTotal);
        containing.makeImmutable();
        const validSquare: ApagosSquare = new ApagosSquare(containing);
        return MGPFallible.success(validSquare);
    }
    private constructor(private readonly containing: MGPMap<PlayerOrNone, number>)
    { }
    public isFull(): boolean {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(Player.NONE);
        return (nbZero + nbOne) >= nbTotal;
    }
    public count(player: PlayerOrNone): number {
        return this.containing.get(player).get();
    }
    public addPiece(piece: Player): ApagosSquare {
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
    public getDominatingPlayer(): PlayerOrNone {
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
