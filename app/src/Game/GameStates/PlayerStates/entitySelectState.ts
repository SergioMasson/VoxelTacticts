import { Camera } from "@babylonjs/core/Cameras/camera";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class EntitySelectState implements GameState
{
    private scene: Scene;
    private onClickObservable: Observer<PointerInfo>;
    private shouldEnd: boolean;
    private board: Board;
    private camera: Camera;
    private cursor: Cursor;
    private soundPlayer: GameSound;

    constructor(scene: Scene, board: Board, camera: Camera, cursor: Cursor, sound: GameSound) 
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
            if(pointerInfo.type == PointerEventTypes.POINTERDOWN)
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