export interface GameState
{
    Start(state: Array<Number>): void;
    End(): Array<Number>;
    Update(deltaT : number): void;
    ShouldEnd(): boolean;
    ShouldEndGame?(): boolean;
}