import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { Entity } from "../../entity";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class EntityMoveState implements GameState
{
    private board: Board;
    private scene: Scene;
    private cursor: Cursor;
    private shouldEnd: boolean;
    private movedEntity: Entity;
    private stateData: Array<number>;
    private soundPlayer: GameSound;

    constructor(scene: Scene, board: Board, camera: Camera, cursor: Cursor, sound: GameSound) {
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