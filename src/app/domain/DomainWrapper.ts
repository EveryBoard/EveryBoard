import { FirebaseJSONObject } from '../utils/utils';

export interface DomainWrapper<I extends FirebaseJSONObject> {
    readonly doc: I;
}
