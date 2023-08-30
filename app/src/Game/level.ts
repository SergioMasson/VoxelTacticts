import { Board } from "./board";
import { Entity } from "./entity";
import { LookDirection } from "./entity";
import * as BABYLON from "@babylonjs/core";

const publicURL = "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public";
const privateURL = ".";
const isLocal = false;

export class GameLevel {

    public static async LoadFromJSONAsync(levelName: string, scene: BABYLON.Scene, camera: BABYLON.ArcRotateCamera): Promise<Board> {
        const response = await fetch(`${isLocal ? privateURL: publicURL}/levels/${levelName}.json`);
        const json = await response.json();

        const width = json.boardWidth;
        const height = json.boardHeight;

        const evenColorJSON = json.boardEvenColor;
        const oddColorJSON = json.boardOddColor;

        const eventColor = new BABYLON.Color3(evenColorJSON.r, evenColorJSON.g, evenColorJSON.b);
        const oddColor = new BABYLON.Color3(oddColorJSON.r, oddColorJSON.g, oddColorJSON.b);

        const board = new Board(scene, width, height, eventColor, oddColor);
        const meshTable = {};

        meshTable["swordman"] = await this.LoadEntity("swordman", new BABYLON.Vector3(0.5, 0.5, 0.5));
        meshTable["druidGirl"] = await this.LoadEntity("druidGirl", new BABYLON.Vector3(0.5, 0.5, 0.5));
        meshTable["enemy"] = await this.LoadEntity("enemy", new BABYLON.Vector3(0.3, 0.3, 0.3));
        meshTable["death"] = await this.LoadEntity("death", new BABYLON.Vector3(0.6, 0.6, 0.6));


        const shieldMesh = await this.LoadEntity("shield", new BABYLON.Vector3(0.3, 0.3, 0.3));

        for (let index = 0; index < json.players.length; index++) {
            const playerData = json.players[index];
            const playerMesh = meshTable[playerData.type];
            var player0 = new Entity(board, playerMesh as BABYLON.Mesh, "player", playerData.health, playerData.attack, playerData.attackRange, playerData.range, shieldMesh as BABYLON.Mesh);
            player0.SetPosition(playerData.x, playerData.z);
        }

        for (let index = 0; index < json.enemies.length; index++) {
            const enemyData = json.enemies[index];
            const enemyMesh = meshTable[enemyData.type];
            const enemyHealth = enemyData.health;
            const enemyAttack = enemyData.attack;
            const enemy0 = new Entity(board, enemyMesh as BABYLON.Mesh, "enemy", enemyHealth, enemyAttack, enemyData.attackRange, enemyData.range, shieldMesh as BABYLON.Mesh);
            enemy0.SetPosition(enemyData.x, enemyData.z);
            enemy0.SetLookDirection(LookDirection.X_PLUS);
        }

        meshTable["stone"] = await this.LoadEntity("stone", new BABYLON.Vector3(0.2, 0.2, 0.2));
        meshTable["grass"] = await this.LoadEntity("grass", new BABYLON.Vector3(0.5, 0.5, 0.5));
        meshTable["flower"] = await this.LoadEntity("flower", new BABYLON.Vector3(0.3, 0.3, 0.3));

        const zBounds = board.GetBoundsDepth();
        const xBounds = board.GetBoundsWidth();

        const maxX = xBounds.y;
        const minX = xBounds.x;
        const maxZ = zBounds.y;
        const minZ = zBounds.x;

        for (let index = 0; index < json.environments.length; index++) {
            const environmentData = json.environments[index];
            const envMesh = meshTable[environmentData.type];
            this.DistributeRandomMeshes(envMesh as BABYLON.Mesh, environmentData.count, maxX, minX, maxZ, minZ);
        }

        this.SetCamera(json, camera);
        return board;
    }

    private static SetCamera(json: any, camera: BABYLON.ArcRotateCamera) {
        if (!json.camera) {
            return;
        }

        const camereJSON = json.camera;

        if (camereJSON.target) {
            camera.target = new BABYLON.Vector3(camereJSON.target.x, camereJSON.target.y, camereJSON.target.z);
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

    private static DistributeRandomMeshes(mesh: BABYLON.Mesh, count: number, maxX: number, minX: number, maxZ: number, minZ: number) {
        for (let index = 0; index < count; index++) {
            const instance = mesh.createInstance(`${mesh.name}_instance${index}`);
            instance.isVisible = true;
            instance.isPickable = false;
            const randomX = Math.random() * (maxX - minX) + minX;
            const randomZ = Math.random() * (maxZ - minZ) + minZ;
            instance.position = new BABYLON.Vector3(randomX, 0, randomZ);
        }
    }

    static async LoadEntity(entityName: string, scaling: BABYLON.Vector3): Promise<BABYLON.AbstractMesh> {
        const resultPlayer = await BABYLON.SceneLoader.ImportMeshAsync(null, "", `https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/models/${entityName}.glb`);
        const result = resultPlayer.meshes[0].getChildMeshes()[0];
        result.scaling = scaling;
        const playerMaterial = new BABYLON.StandardMaterial("");
        result.material = playerMaterial;
        result.isVisible = false;

        playerMaterial.diffuseTexture = new BABYLON.Texture(`https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/textures/player.png`);
        return result;
    }
}