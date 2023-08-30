import { Camera } from "@babylonjs/core/Cameras/camera";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class CellSelectState implements GameState
{
    private board: Board;
    private scene: Scene;
    private cursor: Cursor;
    private shouldEnd: boolean;
    private onClickObservable: Observer<PointerInfo>;
    private nextStateInfo: Array<Number>;
    private soundPlayer: GameSound;

    constructor(scene: Scene, board: Board, camera: Camera, cursor: Cursor, sound: GameSound) {
        this.board = board;
        this.scene = scene;
        this.cursor = cursor;
        this.soundPlayer = sound;
    }

    Start(selectedEntityPos: Array<number>): void 
    {
        this.soundPlayer.Layer2();
        let entity = this.board.GetEntityAtCell(selectedEntityPos[0], selectedEntityPos[1]);
        if (entity) {
            this.board.HighlightCells(selectedEntityPos[0], selectedEntityPos[1], entity.GetRange());
        }

        this.nextStateInfo = new Array<Number>();
        this.nextStateInfo.push(selectedEntityPos[0]);
        this.nextStateInfo.push(selectedEntityPos[1]);

        const selectState = this;

        this.onClickObservable = this.scene.onPointerObservable.add((pointerInfo) => 
        {
            if(pointerInfo.type == PointerEventTypes.POINTERDOWN)
            {
                if (this.cursor.getCursorOverCell()) {
                    let cursorPos = this.cursor.getCursorOverPos();
                    if (this.board.isCellHighlighted(cursorPos.x, cursorPos.y)) {
                        selectState.nextStateInfo.push(cursorPos.x, cursorPos.y);
                        this.shouldEnd = true;
                    }
                }
            }
        });

        this.shouldEnd = false;
    }

    End(): Array<Number> 
    {
        this.board.UnHighlightCells();
        this.scene.onPointerObservable.remove(this.onClickObservable);
        return this.nextStateInfo;
    }

    Update(deltaT : number): void 
    {
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }
} 