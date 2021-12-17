import { JSONObject } from '../utils/utils';

export interface IMessage extends JSONObject {
    // This model is not a collection/table in DB, it's a model contained in a chat
    content: string;
    sender: string;
    postedTime: number; // timeStamp of the publication time
    currentTurn?: number; // number of the turn when this message was written
}
