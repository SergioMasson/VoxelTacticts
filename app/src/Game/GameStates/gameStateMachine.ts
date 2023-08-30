import { GameState } from "./state";
import { Board } from "../board";
import { Cursor } from "../cursor";
import * as BABYLON from "@babylonjs/core";

import { EntitySelectState } from "./PlayerStates/entitySelectState";
import { CellSelectState } from "./PlayerStates/cellSelectState";
import { EntityMoveState } from "./PlayerStates/entityMoveState";
import { ActionSelectState } from "./PlayerStates/actionSelectState";
import { ActionExecuteState } from "./PlayerStates/actionExecuteState";
import { CameraMoveToEntityState } from "./PlayerStates/cameraMoveToEntityState";
import { EnemySelectState } from "./EnemyStates/enemySelectState";
import { EnemyMoveCamera } from "./EnemyStates/enemyMoveCamera";
import { EnemySelectCell } from "./EnemyStates/enemySelectCell";
import { EnemyActionExecute } from "./EnemyStates/enemyActionExecute";
import { CheckGameEndedState } from "./CheckGameEndedState";
import { Sound } from "../sound";

export class GameStateMachine 
{
    states: Array<GameState>;
    currentStateIndex: number;
    isEnemyTurn: Boolean;

    constructor(board: Board, scene: BABYLON.Scene, camera: BABYLON.Camera, cursor: Cursor, sound: Sound)
    {
        this.states = new Array<GameState>();
        this.states.push(new EntitySelectState(scene, board, camera, cursor, sound));
        this.states.push(new CameraMoveToEntityState(board, camera as BABYLON.ArcRotateCamera));
        this.states.push(new CellSelectState(scene, board, camera, cursor, sound));
        this.states.push(new EntityMoveState(scene, board, camera, cursor, sound));
        this.states.push(new ActionSelectState(scene, board, camera, cursor, sound));
        this.states.push(new ActionExecuteState(scene, board, camera, cursor, sound));
        this.states.push(new CheckGameEndedState(board));
        
        this.states.push(new EnemySelectState(scene, board, camera, cursor, sound));
        this.states.push(new EnemyMoveCamera(board, camera as BABYLON.ArcRotateCamera));
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