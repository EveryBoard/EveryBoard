export interface IMessage {
    /* This model is not a collection/table in DB, it's a model contained in a chat
     *
     */
    content: string;
    sender: string;
    postedTime: number; // timeStamp of the publication time
    lastTurnThen: number; // number of the turn when this was write
}
