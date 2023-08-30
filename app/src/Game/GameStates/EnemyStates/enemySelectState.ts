import { Board } from "../../board";
import { GameState } from "./../state";
import { Cursor } from "../../cursor";
import * as BABYLON from "@babylonjs/core";
import { Entity } from "../../entity";
import { Sound } from "../../sound";

export class EnemySelectState implements GameState
{
    private scene: BABYLON.Scene;
    private onClickObservable: BABYLON.Observer<BABYLON.PointerInfo>;
    private shouldEnd: boolean;
    private board: Board;
    private camera: BABYLON.Camera;
	private cursor: Cursor;
	
    private selectedEnemy: Entity;
    
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
            this.soundPlayer.Layer3();
			this.shouldEnd = false;
			let enemies = this.board.FindEntitiesOfType("enemy");

			if (enemies.length > 0) {
				this.selectedEnemy = enemies[Math.round(Math.random() * (enemies.length - 1))];
				let selectedPos = this.selectedEnemy.GetBoardPosition();

				this.cursor.moveCursorTo(selectedPos.x, selectedPos.y, true);
				this.cursor.fixCursor();
                this.shouldEnd = true;
                
                this.soundPlayer.SelectSound();
			}
			else {
				this.shouldEnd = false;
			}
    }

    End(): Array<Number> 
    {
        return [this.selectedEnemy.GetBoardPosition().x, this.selectedEnemy.GetBoardPosition().y];
    }

    Update(deltaT : number): void 
    {
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }   
}