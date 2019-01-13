import {IMessage} from './imessage';

export interface IChat {
	/* the Id will always be the same as the joiner doc and part doc, or "server"
	 *
	 */
	messages: IMessage[];
	status: number; // 0: open, 1: closed;
}

export interface PIChat {
	messages?: IMessage[];
	status?: number;
}

export interface IChatId {
	id: string;
	chat: IChat;
}
