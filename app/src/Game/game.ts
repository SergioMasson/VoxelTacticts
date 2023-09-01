import "@babylonjs/core/Animations/animatable";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/sceneComponent";
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

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { GameStateMachine } from "./GameStates/gameStateMachine";
import { Board } from "./board";
import { Cursor } from "./cursor";
import { GameLevel } from "./level";
import { GameSound } from "./sound";
import { StartScreen } from "./startScreen";


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

    StartLevel(level: string) : void
    {
        this.scene = new Scene(this.engine);
        this.scene.createDefaultCameraOrLight();
        const startScreen = new StartScreen();
        startScreen.Show(this.scene).then(async () => 
        {
            this.scene.dispose();
            this.LoadLevel(level);
        });
    }

    async LoadLevel(level: string) : Promise<void> 
    {
        this.disposed = false;
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

        const UITexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, this.scene);
        const loadedGUI = await UITexture.parseFromURLAsync("./UI/mainScreen.json");
        const instructionsText = loadedGUI.getControlByName("InstructionsText") as TextBlock;

        this.gameStateMachine = new GameStateMachine(this.board, this.scene, mainCamera, this.cursor, this.sound, instructionsText);
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

        this.LoadLevel(level);
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

        if(!this.gameStateMachine) {
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

        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.parseFromURLAsync("./UI/END_SCREEN.json");
        this.sound.MuteMusic();
    }

    Update(deltaT: number) : void
    {
        if(this.scene) {
            this.scene.render();
        }

        if (this.disposed) {
            return;
        }

        if (this.cursor) {
            this.cursor.Update();
        }

        if (this.board) {
            this.board.update(deltaT);
        }
        
        if (this.gameStateMachine) {
            this.gameStateMachine.Update(deltaT);
        }
    }
}