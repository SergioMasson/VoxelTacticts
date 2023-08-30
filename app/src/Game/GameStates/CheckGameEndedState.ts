import { Board } from "../board";

export class CheckGameEndedState
{
    stateData: Array<Number>;
    board: Board;

    constructor(board: Board)
    {
        this.board = board;
    }

    Start(state: Array<Number>): void
    {
        this.stateData = state;
    }

    End(): Array<Number>
    {
        return this.stateData;
    }

    Update(deltaT : number): void
    {

    }

    ShouldEnd(): boolean
    {
        return true;
    }

    ShouldEndGame?(): boolean
    {
        return (this.board.FindEntitiesOfType("enemy").length == 0) || (this.board.FindEntitiesOfType("player").length == 0);
    }
}