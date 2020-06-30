import { Part } from "./icurrentpart"

export class PartMocks {

    public static readonly INITIAL: Part = new Part("Quarto", "creator", -1, [], 5);

    public static readonly STARTING: Part = new Part("Quarto", "creator", 0, [], 5, "firstCandidate");
}