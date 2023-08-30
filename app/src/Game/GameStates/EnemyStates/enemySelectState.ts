import { Camera } from "@babylonjs/core/Cameras/camera";
import { PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { Entity } from "../../entity";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class EnemySelectState implements GameState
{
    private scene: Scene;
    private onClickObservable: Observer<PointerInfo>;
    private shouldEnd: boolean;
    private board: Board;
    private camera: Camera;
	private cursor: Cursor;
	
    private selectedEnemy: Entity;
    
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