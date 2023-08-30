import { GameState } from "./../state";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import * as BABYLON from "@babylonjs/core";
import { Entity } from "../../entity";
import { Sound } from "../../sound";

const FRAME_WAIT = 60;

export class EnemySelectCell implements GameState {
	private board: Board;
	private scene: BABYLON.Scene;
	private cursor: Cursor;
	private shouldEnd: boolean;
	private nextStateInfo: Array<Number>;
	private timer: number;

	private selectedEntity: Entity;
	private movePos: BABYLON.Vector2;

	private soundPlayer: Sound;

	constructor(scene: BABYLON.Scene, board: Board, camera: BABYLON.Camera, cursor: Cursor, sound: Sound) {
		this.board = board;
		this.scene = scene;
		this.cursor = cursor;

		this.soundPlayer = sound;
	}

	Start(selectedEntityPos: Array<number>): void {
		let entity = this.board.GetEntityAtCell(selectedEntityPos[0], selectedEntityPos[1]);
		let players = this.board.FindEntitiesOfType("player");

		this.movePos = new BABYLON.Vector2(selectedEntityPos[0], selectedEntityPos[1]);
		this.nextStateInfo = selectedEntityPos;
		this.board.HighlightCells(selectedEntityPos[0], selectedEntityPos[1], entity.GetRange());

		if (entity) {
			this.selectedEntity = entity;

			let celulasPossiveis = this.board.FindAround(selectedEntityPos[0], selectedEntityPos[1], entity.GetRange(), "cell", false);
			let melhorCelula = 0;
			let melhorDistancia = Infinity;

			for (let c = 0; c < celulasPossiveis.length; c++) {
				let cell = celulasPossiveis[c];

				for (let p in players) {
					let player = players[p];

					let deltaX = Math.abs(player.getEntityBoardPos().x - cell.metadata.x);
					let deltaZ = Math.abs(player.getEntityBoardPos().y - cell.metadata.z);

					let nomr1Dist = deltaX + deltaZ;

					if (nomr1Dist < melhorDistancia) {
						melhorDistancia = nomr1Dist;
						melhorCelula = c;
					}
				}
			}

			this.movePos.x = celulasPossiveis[melhorCelula].metadata.x;
			this.movePos.y = celulasPossiveis[melhorCelula].metadata.z;
		}

		this.shouldEnd = false;
		this.timer = 0;
	}

	End(): Array<Number> {
		this.board.UnHighlightCells();
		this.selectedEntity.SetPosition(this.movePos.x, this.movePos.y);
		this.cursor.unfixCursor();
		this.nextStateInfo.push(this.movePos.x, this.movePos.y);
		return this.nextStateInfo;
	}

	Update(deltaT: number): void {
		this.timer += deltaT;

		if (this.timer > 1) {
			this.shouldEnd = true;
		}
	}

	ShouldEnd(): boolean {
		return this.shouldEnd;
	}
} 