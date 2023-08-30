import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";

import { Board } from "../../board";
import { Cursor } from "../../cursor";
import { GameSound } from "../../sound";
import { GameState } from "./../state";

export class ActionSelectState implements GameState
{
    private board: Board;
    private UI: AdvancedDynamicTexture;
    private shouldEnd: boolean;
    private gameState: Array<number>;
    private soundPlayer: GameSound;
    
    constructor(scene: Scene, board: Board, camera: Camera, cursor: Cursor, sound: GameSound)
    {
        this.board = board;
        this.soundPlayer = sound;
    }

    createButton(texto: string, left: number, top: number, actionState: ActionSelectState): Button {
        var button1 = Button.CreateSimpleButton("but1", texto);
        button1.width = "150px"
        button1.height = "40px";
        button1.color = "white";
        button1.cornerRadius = 20;
        button1.background = "green";
        button1.onPointerUpObservable.add(function() {
            actionState.UI.dispose();
            actionState.shouldEnd = true;
            if (texto === "Atacar") actionState.gameState.push(1);
            else actionState.gameState.push(0);
        });

        button1.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        button1.left = left + "%";
        button1.top = top + "%";

        return button1;
    }

    Start(state: Array<number>): void 
    {
        let adjacentCells = this.board.FindAround(state[2], state[3], 2, "cell", true);
        let attackedEntities = [];
        this.UI = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        for (let c in adjacentCells) {
            let cell = adjacentCells[c];
            let enemyEntity = this.board.GetEntityAtCell(cell.metadata.x, cell.metadata.z);

            if (enemyEntity) {
                if (enemyEntity.GetType() === "enemy") attackedEntities.push(enemyEntity);
            }
        }

        if (attackedEntities.length > 0) {
            this.UI.addControl(this.createButton("Atacar", -10, 50, this));   
            this.UI.addControl(this.createButton("Bloquear", 10, 50, this));
        }
        else {
            this.UI.addControl(this.createButton("Bloquear", 0, 50, this));
        }

        this.gameState = state;

        this.shouldEnd = false;
    }

    End(): Array<Number> 
    {
        this.UI.dispose();
        return this.gameState;
    }

    Update(deltaT : number): void 
    {
        
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }

}