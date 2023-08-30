import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { Board } from "./board";
import { Cursor } from "./cursor";
import { GameStateMachine } from "./GameStates/gameStateMachine";
import { GameLevel } from "./level";
import { Sound } from "./sound";

export class Game 
{
    private engine : BABYLON.Engine;
    private canvas: HTMLCanvasElement;

    private scene : BABYLON.Scene;
    private board : Board;
    private cursor : Cursor;
    private gameStateMachine: GameStateMachine;
    private sound: Sound;

    private disposed: boolean;

    constructor(engine: BABYLON.Engine, canvas : HTMLCanvasElement) 
    {
        this.engine = engine;
        this.canvas = canvas;
    }

    async StartLevel(level: string) : Promise<void> 
    {
        this.scene = new BABYLON.Scene(this.engine);
        this.sound = new Sound(this.scene);
        const mainCamera = new BABYLON.ArcRotateCamera("mainCamera", Math.PI / 4, Math.PI / 3, 9, new BABYLON.Vector3(-1, 0, 0), this.scene);
        mainCamera.attachControl(this.canvas);
        mainCamera.upperRadiusLimit = 10;
        mainCamera.lowerRadiusLimit = 3;
        mainCamera.upperBetaLimit = Math.PI / 3;
        mainCamera.lowerBetaLimit = Math.PI / 6;
        mainCamera.target = new BABYLON.Vector3(-7, 0, -4);
        mainCamera.radius = 8;
        mainCamera.alpha = Math.PI / 4;
        mainCamera.beta = Math.PI / 3;

        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        const pointerMesh = await this.LoadEntity("pointer", new BABYLON.Vector3(0.7, 0.7, 0.7));
        pointerMesh.isVisible = true;
        
        this.board = await GameLevel.LoadFromJSONAsync(level, this.scene, mainCamera);
        this.cursor = new Cursor(this.board, this.scene, mainCamera, pointerMesh as BABYLON.Mesh);    
        this.gameStateMachine = new GameStateMachine(this.board, this.scene, mainCamera, this.cursor, this.sound);
        this.disposed = false;
    }

    LoadNewLevel(level: string) : void
    {
        this.scene.dispose();
        this.scene = null;
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.createDefaultCamera();
        this.cursor = null;
        this.board = null;
        this.gameStateMachine = null;
        this.disposed = true;

        this.StartLevel(level);
    }

    async LoadEntity(entityName: string, scaling: BABYLON.Vector3) : Promise<BABYLON.AbstractMesh>
    {
        const resultPlayer = await BABYLON.SceneLoader.ImportMeshAsync(null, "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/models/", `${entityName}.glb`);
        const result = resultPlayer.meshes[0];
        result.scaling = scaling;
        const playerMaterial = new BABYLON.StandardMaterial("");
        result.material = playerMaterial;
        result.isVisible = false;

        playerMaterial.diffuseTexture = new BABYLON.Texture(`./textures/player.png`);
        return result;
    }

    ShouldEndLevel() : boolean
    {
        if (this.disposed) {
            return false;
        }

        return this.gameStateMachine.ShouldEndGame();
    }

    ShowEndGameScreen(): void
    {
        this.scene.dispose();
        this.scene = null;
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.createDefaultCamera();
        this.cursor = null;
        this.board = null;
        this.gameStateMachine = null;
        this.disposed = true;

        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.parseFromURLAsync("https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/UI/END_SCREEN.json");
        this.sound.MuteMusic();
    }

    Update(deltaT: number) : void
    {
        this.scene.render();

        if (this.disposed) {
            return;
        }

        this.cursor.Update();
        this.board.update(deltaT);
        this.gameStateMachine.Update(deltaT);
        
    }
}