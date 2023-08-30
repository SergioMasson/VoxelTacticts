import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";
import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { Entity } from "../../entity";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class ActionExecuteState implements GameState
{
    private board: Board;
		private shouldEnd: boolean;
		private watchedEntity: Entity;
		private attackedEntities: Array<Entity>;
		private gameState: Array<number>;
		private soundPlayer: GameSound;
    
    constructor(scene: Scene, board: Board, camera: Camera, cursor: Cursor, sound: GameSound)
    {
			this.board = board;
			this.soundPlayer = sound;
    }

    Start(state: Array<number>): void 
		{
			let entity = this.board.GetEntityAtCell(state[2], state[3]);

			let adjacentCells = this.board.FindAround(state[2], state[3], 2, "cell", true);
			this.attackedEntities = [];
			
      for (let c in adjacentCells) {
        let cell = adjacentCells[c];
        let enemyEntity = this.board.GetEntityAtCell(cell.metadata.x, cell.metadata.z);

        if (enemyEntity) {
          if (enemyEntity.GetType() === "enemy") this.attackedEntities.push(enemyEntity);
        }
			}

			if (state[4]) {
				entity.PlayAttackAnim();
				this.shouldEnd = false;
			}
			else {
				this.shouldEnd = true;
				entity.Block();
			}

			this.watchedEntity = entity;
			this.gameState = state;
    }

    End(): Array<Number> 
    {
        return [0];
    }

    Update(deltaT : number): void 
		{
			if (this.gameState[4]) {
				if (!this.watchedEntity.IsAnimating()) {
					for (let e in this.attackedEntities) {
						let aEntity = this.attackedEntities[e];
						aEntity.InflictDamage(this.watchedEntity.GetAttackPoints());

						this.soundPlayer.AttackSound();
					}
		
					this.shouldEnd = true;
				}
			}
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }

}