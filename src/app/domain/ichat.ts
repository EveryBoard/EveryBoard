import { JSONObject } from '../utils/utils';
import { IMessage } from './imessage';

export interface IChat extends JSONObject {
    // the Id will always be the same as the joiner doc and part doc, or "server"
    messages: IMessage[];
}

