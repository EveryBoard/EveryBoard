export class  RequestCode {

    public static ZERO_PROPOSED_DRAW = new RequestCode('ZERO_PROPOSED_DRAW');

    public static ONE_PROPOSED_DRAW = new RequestCode('ONE_PROPOSED_DRAW');

    public static ZERO_ADDED_TIME = new RequestCode('ZERO_ADDED_TIME');

    public static ONE_ADDED_TIME = new RequestCode('ONE_ADDED_TIME');

    public static ZERO_ASKED_TAKE_BACK = new RequestCode('ZERO_ASKED_TAKE_BACK');

    public static ONE_ASKED_TAKE_BACK = new RequestCode('ONE_ASKED_TAKE_BACK');

    public static ZERO_PROPOSED_REMATCH = new RequestCode('ZERO_PROPOSED_REMATCH');

    public static ONE_PROPOSED_REMATCH = new RequestCode('ONE_PROPOSED_REMATCH');

    public static REMATCH_ACCEPTED = new RequestCode('REMATCH_ACCEPTED'); // TODO: separate in two

    public static ZERO_ACCEPTED_TAKE_BACK = new RequestCode('ZERO_ACCEPTED_TAKE_BACK');

    public static ONE_ACCEPTED_TAKE_BACK = new RequestCode('ONE_ACCEPTED_TAKE_BACK');

    private constructor(public readonly value: string) {};
}
export interface IMGPRequest {
    code: string;

    partId?: string;

    typeGame?: string;
}
export class MGPRequest {

    public readonly code: string;

    public constructor(
        code: RequestCode,
        public readonly partId?: string,
        public readonly typeGame?: string
    ) {
        if (code === RequestCode.REMATCH_ACCEPTED &&
            (partId == null || typeGame == null))
        {
            throw new Error("To accept rematch, one must provide new partId and typeGame.");
        }
        this.code = code.value;
        if (this.partId === undefined) this.partId = null;
        if (this.typeGame === undefined) this.typeGame = null;
    }
}
