import "@babylonjs/core/Animations/animatable";
import "@babylonjs/loaders/glTF";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";

import * as GUI from "@babylonjs/gui";
import { GameStateMachine } from "./GameStates/gameStateMachine";
import { Board } from "./board";
import { Cursor } from "./cursor";
import { GameLevel } from "./level";
import { GameSound } from "./sound";


export class Game 
{
    private engine : Engine;
    private canvas: HTMLCanvasElement;

    private scene : Scene;
    private board : Board;
    private cursor : Cursor;
    private gameStateMachine: GameStateMachine;
    private sound: GameSound;

    private disposed: boolean;

    constructor(engine: Engine, canvas : HTMLCanvasElement) 
    {
        this.engine = engine;
        this.canvas = canvas;
    }

    async StartLevel(level: string) : Promise<void> 
    {
        this.scene = new Scene(this.engine);
        this.sound = new GameSound(this.scene);
        const mainCamera = new ArcRotateCamera("mainCamera", Math.PI / 4, Math.PI / 3, 9, new Vector3(-1, 0, 0), this.scene);
        mainCamera.attachControl(this.canvas);
        mainCamera.upperRadiusLimit = 10;
        mainCamera.lowerRadiusLimit = 3;
        mainCamera.upperBetaLimit = Math.PI / 3;
        mainCamera.lowerBetaLimit = Math.PI / 6;
        mainCamera.target = new Vector3(-7, 0, -4);
        mainCamera.radius = 8;
        mainCamera.alpha = Math.PI / 4;
        mainCamera.beta = Math.PI / 3;

        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        const pointerMesh = await this.LoadEntity("pointer", new Vector3(0.7, 0.7, 0.7));
        pointerMesh.isVisible = true;
        
        this.board = await GameLevel.LoadFromJSONAsync(level, this.scene, mainCamera);
        this.cursor = new Cursor(this.board, this.scene, mainCamera, pointerMesh as Mesh);    
        this.gameStateMachine = new GameStateMachine(this.board, this.scene, mainCamera, this.cursor, this.sound);
        this.disposed = false;
    }

    LoadNewLevel(level: string) : void
    {
        this.scene.dispose();
        this.scene = null;
        this.scene = new Scene(this.engine);
        this.cursor = null;
        this.board = null;
        this.gameStateMachine = null;
        this.disposed = true;

        this.StartLevel(level);
    }

    async LoadEntity(entityName: string, scaling: Vector3) : Promise<AbstractMesh>
    {
        const resultPlayer = await SceneLoader.ImportMeshAsync(null, "./models/", `${entityName}.glb`);
        const result = resultPlayer.meshes[0];
        result.scaling = scaling;
        const playerMaterial = new StandardMaterial("");
        result.material = playerMaterial;
        result.isVisible = false;
        playerMaterial.diffuseTexture = new Texture(`./textures/player.png`);
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
        this.scene = new Scene(this.engine);
        const mainCamera = new ArcRotateCamera("mainCamera", Math.PI / 4, Math.PI / 3, 9, new Vector3(-1, 0, 0), this.scene);
        this.cursor = null;
        this.board = null;
        this.gameStateMachine = null;
        this.disposed = true;

        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.parseFromURLAsync("./UI/END_SCREEN.json");
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