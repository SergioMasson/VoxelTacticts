import { GameState } from "./../state";
import { Cursor } from "../../cursor";
import { Board } from "../../board";
import { Entity } from "../../entity";
import * as BABYLON from "@babylonjs/core";
import { Sound } from "../../sound";

export class EntityMoveState implements GameState
{
    private board: Board;
    private scene: BABYLON.Scene;
    private cursor: Cursor;
    private shouldEnd: boolean;
    private movedEntity: Entity;
    private stateData: Array<number>;
    private soundPlayer: Sound;

    constructor(scene: BABYLON.Scene, board: Board, camera: BABYLON.Camera, cursor: Cursor, sound: Sound) {
        this.board = board;
        this.scene = scene;
        this.cursor = cursor;
        this.soundPlayer = sound;
    }

    Start(selectedCellPos: Array<number>): void 
    {
        let entity = this.board.GetEntityAtCell(selectedCellPos[0], selectedCellPos[1]);
        if (entity) {
            if (entity.GetType() === "player") {
                this.movedEntity = entity;
                entity.SetPosition(selectedCellPos[2], selectedCellPos[3]);
                this.cursor.unfixCursor();
                this.shouldEnd = true;
                this.stateData = selectedCellPos;
                this.soundPlayer.MoveSound();
            }
        }
        else this.shouldEnd = false;
    }

    End(): Array<Number> 
    {
        console.log("Ending entityMoveState");
        return this.stateData;
    }

    Update(deltaT : number): void 
    {
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }
    
} 