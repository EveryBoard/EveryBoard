import { JSONObject } from '../utils/utils';

export interface DomainWrapper<I extends JSONObject> {
    readonly doc: I;
}
