import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { SaharaRules, SaharaMove, SaharaPartSlice,  } from './SaharaRules';
describe('SaharaMoves', () => {
    it('SaharaMoves should be created bidirectionnaly encodable/decodable', () => {
        const rules: SaharaRules = new SaharaRules();
        expect(rules).toBeTruthy();
        const moves: MGPMap<SaharaMove, SaharaPartSlice> = rules.getListMoves(rules.node);
        for (let i=0; i<moves.size(); i++) {
            const initialMove: SaharaMove = moves.get(i).key;
            const encodedMove: number = initialMove.encode();
            const decodedMove: SaharaMove = SaharaMove.decode(encodedMove);
            expect(decodedMove).toEqual(initialMove, initialMove.toString() + " should be correctly translated");
        }
    });
});