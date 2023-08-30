import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";

import { Board } from "../board";
import { Cursor } from "../cursor";
import { GameState } from "./state";

import { GameSound } from "../sound";
import { CheckGameEndedState } from "./CheckGameEndedState";
import { EnemyActionExecute } from "./EnemyStates/enemyActionExecute";
import { EnemyMoveCamera } from "./EnemyStates/enemyMoveCamera";
import { EnemySelectCell } from "./EnemyStates/enemySelectCell";
import { EnemySelectState } from "./EnemyStates/enemySelectState";
import { ActionExecuteState } from "./PlayerStates/actionExecuteState";
import { ActionSelectState } from "./PlayerStates/actionSelectState";
import { CameraMoveToEntityState } from "./PlayerStates/cameraMoveToEntityState";
import { CellSelectState } from "./PlayerStates/cellSelectState";
import { EntityMoveState } from "./PlayerStates/entityMoveState";
import { EntitySelectState } from "./PlayerStates/entitySelectState";

export class GameStateMachine 
{
    states: Array<GameState>;
    currentStateIndex: number;
    isEnemyTurn: Boolean;

    constructor(board: Board, scene: Scene, camera: Camera, cursor: Cursor, sound: GameSound)
    {
        this.states = new Array<GameState>();
        this.states.push(new EntitySelectState(scene, board, camera, cursor, sound));
        this.states.push(new CameraMoveToEntityState(board, camera as ArcRotateCamera));
        this.states.push(new CellSelectState(scene, board, camera, cursor, sound));
        this.states.push(new EntityMoveState(scene, board, camera, cursor, sound));
        this.states.push(new ActionSelectState(scene, board, camera, cursor, sound));
        this.states.push(new ActionExecuteState(scene, board, camera, cursor, sound));
        this.states.push(new CheckGameEndedState(board));
        
        this.states.push(new EnemySelectState(scene, board, camera, cursor, sound));
        this.states.push(new EnemyMoveCamera(board, camera as ArcRotateCamera));
        this.states.push(new EnemySelectCell(scene, board, camera, cursor, sound));
        this.states.push(new EnemyActionExecute(scene, board, camera, cursor, sound));
        this.states.push(new CheckGameEndedState(board));

        this.currentStateIndex = 0;

        let currentState = this.GetCurrentState();
        currentState.Start([]);
    }

    Update(deltaT : number) : void
    {
        let currentState = this.GetCurrentState();

        if(currentState.ShouldEnd())
        {
            let selectData = currentState.End();
            currentState = this.MoveToNextState();
            currentState.Start(selectData);    
        }

        currentState.Update(deltaT);
    }

    ShouldEndGame() : boolean
    {
        let currentState = this.GetCurrentState();

        if(!currentState.ShouldEndGame){
            return false;
        }

        return currentState.ShouldEndGame();
    }

    private GetCurrentState() : GameState
    {
        return this.states[this.currentStateIndex];
    }

    private MoveToNextState() : GameState 
    {
        this.currentStateIndex++;
        this.currentStateIndex = this.currentStateIndex % this.states.length;
        return this.GetCurrentState();
    }
}