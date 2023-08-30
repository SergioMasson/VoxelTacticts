import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";

import { Board } from "./board";
import { Entity, LookDirection } from "./entity";


const publicURL = "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public";
const privateURL = ".";
const isLocal = true;

export class GameLevel {

    public static async LoadFromJSONAsync(levelName: string, scene: Scene, camera: ArcRotateCamera): Promise<Board> {
        const response = await fetch(`${isLocal ? privateURL: publicURL}/levels/${levelName}.json`);
        const json = await response.json();

        const width = json.boardWidth;
        const height = json.boardHeight;

        const evenColorJSON = json.boardEvenColor;
        const oddColorJSON = json.boardOddColor;

        const eventColor = new Color3(evenColorJSON.r, evenColorJSON.g, evenColorJSON.b);
        const oddColor = new Color3(oddColorJSON.r, oddColorJSON.g, oddColorJSON.b);

        const board = new Board(scene, width, height, eventColor, oddColor);
        const meshTable = {};

        meshTable["swordman"] = await this.LoadEntity("swordman", new Vector3(0.5, 0.5, 0.5));
        meshTable["druidGirl"] = await this.LoadEntity("druidGirl", new Vector3(0.5, 0.5, 0.5));
        meshTable["enemy"] = await this.LoadEntity("enemy", new Vector3(0.3, 0.3, 0.3));
        meshTable["death"] = await this.LoadEntity("death", new Vector3(0.6, 0.6, 0.6));


        const shieldMesh = await this.LoadEntity("shield", new Vector3(0.3, 0.3, 0.3));

        for (let index = 0; index < json.players.length; index++) {
            const playerData = json.players[index];
            const playerMesh = meshTable[playerData.type];
            var player0 = new Entity(board, playerMesh as Mesh, "player", playerData.health, playerData.attack, playerData.attackRange, playerData.range, shieldMesh as Mesh);
            player0.SetPosition(playerData.x, playerData.z);
        }

        for (let index = 0; index < json.enemies.length; index++) {
            const enemyData = json.enemies[index];
            const enemyMesh = meshTable[enemyData.type];
            const enemyHealth = enemyData.health;
            const enemyAttack = enemyData.attack;
            const enemy0 = new Entity(board, enemyMesh as Mesh, "enemy", enemyHealth, enemyAttack, enemyData.attackRange, enemyData.range, shieldMesh as Mesh);
            enemy0.SetPosition(enemyData.x, enemyData.z);
            enemy0.SetLookDirection(LookDirection.X_PLUS);
        }

        meshTable["stone"] = await this.LoadEntity("stone", new Vector3(0.2, 0.2, 0.2));
        meshTable["grass"] = await this.LoadEntity("grass", new Vector3(0.5, 0.5, 0.5));
        meshTable["flower"] = await this.LoadEntity("flower", new Vector3(0.3, 0.3, 0.3));

        const zBounds = board.GetBoundsDepth();
        const xBounds = board.GetBoundsWidth();

        const maxX = xBounds.y;
        const minX = xBounds.x;
        const maxZ = zBounds.y;
        const minZ = zBounds.x;

        for (let index = 0; index < json.environments.length; index++) {
            const environmentData = json.environments[index];
            const envMesh = meshTable[environmentData.type];
            this.DistributeRandomMeshes(envMesh as Mesh, environmentData.count, maxX, minX, maxZ, minZ);
        }

        this.SetCamera(json, camera);
        return board;
    }

    private static SetCamera(json: any, camera: ArcRotateCamera) {
        if (!json.camera) {
            return;
        }

        const camereJSON = json.camera;

        if (camereJSON.target) {
            camera.target = new Vector3(camereJSON.target.x, camereJSON.target.y, camereJSON.target.z);
        }

        if (camereJSON.alpha) {
            camera.alpha = camereJSON.alpha;
        }

        if (camereJSON.beta) {
            camera.beta = camereJSON.beta;
        }

        if (camereJSON.radius) {
            camera.radius = camereJSON.radius;
        }

    }

    private static DistributeRandomMeshes(mesh: Mesh, count: number, maxX: number, minX: number, maxZ: number, minZ: number) {
        for (let index = 0; index < count; index++) {
            const instance = mesh.createInstance(`${mesh.name}_instance${index}`);
            instance.isVisible = true;
            instance.isPickable = false;
            const randomX = Math.random() * (maxX - minX) + minX;
            const randomZ = Math.random() * (maxZ - minZ) + minZ;
            instance.position = new Vector3(randomX, 0, randomZ);
        }
    }

    static async LoadEntity(entityName: string, scaling: Vector3): Promise<AbstractMesh> {
        const resultPlayer = await SceneLoader.ImportMeshAsync(null, "", `https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/models/${entityName}.glb`);
        const result = resultPlayer.meshes[0].getChildMeshes()[0];
        result.scaling = scaling;
        const playerMaterial = new StandardMaterial("");
        result.material = playerMaterial;
        result.isVisible = false;

        playerMaterial.diffuseTexture = new Texture(`https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/textures/player.png`);
        return result;
    }
}