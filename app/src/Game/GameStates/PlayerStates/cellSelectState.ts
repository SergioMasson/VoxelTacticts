import { GameState } from "./../state";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import * as BABYLON from "@babylonjs/core";
import { Sound } from "../../sound";

export class CellSelectState implements GameState
{
    private board: Board;
    private scene: BABYLON.Scene;
    private cursor: Cursor;
    private shouldEnd: boolean;
    private onClickObservable: BABYLON.Observer<BABYLON.PointerInfo>;
    private nextStateInfo: Array<Number>;
    private soundPlayer: Sound;

    constructor(scene: BABYLON.Scene, board: Board, camera: BABYLON.Camera, cursor: Cursor, sound: Sound) {
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
            if(pointerInfo.type == BABYLON.PointerEventTypes.POINTERDOWN)
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