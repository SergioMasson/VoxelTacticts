import { GameState } from "./../state";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { Entity } from "../../entity";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { Sound } from "../../sound";

const FRAME_WAIT = 1;

export class EnemyActionExecute implements GameState {
	private board: Board;
	private shouldEnd: boolean;
	private watchedEntity: Entity;
	private playersAttacked: Array<Entity>;
	private playersBlocking: number;
	private timer: number;
	private canAttack: boolean;
	private soundPlayer: Sound;

	constructor(scene: BABYLON.Scene, board: Board, camera: BABYLON.Camera, cursor: Cursor, sound: Sound) {
		this.board = board;
		this.soundPlayer = sound;
	}

	Start(state: Array<number>): void {
		this.playersAttacked = [];
		this.playersBlocking = 0;
		this.timer = 0;
		this.canAttack = false;

		let entity = this.board.GetEntityAtCell(state[2], state[3]);
		let players = this.board.FindEntitiesOfType("player");

		this.watchedEntity = entity;

		for (let p = 0; p < players.length; p++) {
			let player = players[p];

			let deltaX = Math.abs(entity.getEntityBoardPos().x - player.getEntityBoardPos().x);
			let deltaZ = Math.abs(entity.getEntityBoardPos().y - player.getEntityBoardPos().y);

			let nomr1Dist = deltaX + deltaZ;

			if (nomr1Dist <= entity.GetAttackRange()) {
				this.playersAttacked.push(player);
			}
			if (nomr1Dist <= player.GetAttackRange()) {
				if (player.IsBlocking()) this.playersBlocking++;
			}
		}

		if (this.playersAttacked.length > 0) {
			this.shouldEnd = false;
		}
		else this.shouldEnd = true;
	}

	End(): Array<Number> {
		return [0];
	}

	Update(deltaT: number): void {
		this.timer += deltaT;

		if (this.timer > FRAME_WAIT && this.canAttack === false) {
			this.canAttack = true;

			this.watchedEntity.PlayAttackAnim();
		}

		if (this.canAttack) {
			if (this.playersAttacked.length > 0) {
				if (!this.watchedEntity.IsAnimating()) {
					for (let e in this.playersAttacked) {
						let aEntity = this.playersAttacked[e];

						let damagePercent = Math.max(1 - (this.playersBlocking * 0.1), 0.1);

						aEntity.InflictDamage(this.watchedEntity.GetAttackPoints() * damagePercent);

						this.soundPlayer.AttackSound();

						console.log(damagePercent);
					}

					this.shouldEnd = true;
				}
			}
		}
	}

	ShouldEnd(): boolean {
		return this.shouldEnd;
	}

}