import { Board } from "../../board";
import { GameState } from "./../state";
import { Cursor } from "../../cursor";
import * as BABYLON from "@babylonjs/core";
import { Sound } from "../../sound";

export class EntitySelectState implements GameState
{
    private scene: BABYLON.Scene;
    private onClickObservable: BABYLON.Observer<BABYLON.PointerInfo>;
    private shouldEnd: boolean;
    private board: Board;
    private camera: BABYLON.Camera;
    private cursor: Cursor;
    private soundPlayer: Sound;

    constructor(scene: BABYLON.Scene, board: Board, camera: BABYLON.Camera, cursor: Cursor, sound: Sound) 
    {
        this.scene = scene;
        this.board = board;
        this.camera = camera;
        this.cursor = cursor;
        this.soundPlayer = sound;
    }

    Start(startSelect: Array<Number>): void
    {
        this.soundPlayer.Layer1();
        console.log("Starting  EntitySelectState");
        this.onClickObservable = this.scene.onPointerObservable.add((pointerInfo) => 
        {
            if(pointerInfo.type == BABYLON.PointerEventTypes.POINTERDOWN)
            {
                if (this.cursor.getCursorOverEntity()) {
                    let cursorPos = this.cursor.getCursorOverPos();
                    let entity = this.board.GetEntityAtCell(cursorPos.x, cursorPos.y);

                    if (entity) {
                        if (entity.GetType() === "player") {
                            this.shouldEnd = true;
                            entity.Unblock();
                            this.soundPlayer.SelectSound();
                        }
                    }
                }
            }
        });

        this.shouldEnd = false;
    }

    End(): Array<Number> 
    {
        console.log("Ending  EntitySelectState");
        this.scene.onPointerObservable.remove(this.onClickObservable);
        this.cursor.fixCursor();
        return [this.cursor.getCursorOverPos().x, this.cursor.getCursorOverPos().y];
    }

    Update(deltaT : number): void 
    {
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }   
}