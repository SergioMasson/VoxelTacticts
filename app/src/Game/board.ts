import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "./entity";

const CELL_WIDTH = 0.5;
const CELL_HEIGHT = 0.05;
const CELL_DEPTH = 0.5;

const flashingPeriod = 0.5;

export class Board
{
    private entities: Array<Entity>;
    private cells: Array<Mesh>;
    private highlightedCells: Array<Mesh>;
    private width : number;
    private height: number;
    
    private colorAlpha: number;
    private timer: number;

    private boardTransform: TransformNode;

    constructor(scene: Scene, width: number, height: number, evenColor: Color3, oddColor: Color3)
    {
        this.cells = new Array<Mesh>();
        this.boardTransform = new TransformNode("Board Root");

        let left = -((width >> 1) * CELL_WIDTH);
        let top = -((height >> 1) * CELL_DEPTH);

        for (let x = 0; x < width; x++) 
        {
            for (let z = 0; z < height; z++) 
            {
                const cell = MeshBuilder.CreateBox(`cell_${x}x${z}`, 
                { 
                    width: CELL_WIDTH, 
                    height: CELL_HEIGHT,
                    depth: CELL_DEPTH
                }, scene);
                
                cell.position = new Vector3(left + x * CELL_WIDTH, 0, top + z * CELL_DEPTH);
                cell.metadata = {type: "cell", x: x, z: z};

                const cellMaterial = new StandardMaterial("");
                cell.material = cellMaterial;
                cellMaterial.diffuseColor = (x & 1) ^ (z & 1) ? evenColor : oddColor;
                this.cells.push(cell);

                cell.parent = this.boardTransform;
            }
        }

        this.entities = new Array<Entity>(width * height);
        this.highlightedCells = new Array<Mesh>(0);
        this.width = width;
        this.height = height;

        this.colorAlpha = 1;
        this.timer = 0;
    }

    update(deltaT: number): void {
        for (let k = 0; k < this.highlightedCells.length; k++) {
            let cell = this.highlightedCells[k];
            let material = cell.material as StandardMaterial;

            material.emissiveColor = new Color3(0.2 + this.colorAlpha / 2, 0.2 + this.colorAlpha / 2, 0.2 + this.colorAlpha / 2);
        }

        for (let t = 0; t < deltaT; t += 1 / 60) {
            let halfPeriod = flashingPeriod * 60;
            if (this.timer < halfPeriod) this.colorAlpha = this.timer / halfPeriod;
            else this.colorAlpha = 1 - ((this.timer - halfPeriod) / halfPeriod);
    
            if (this.timer > 2 * halfPeriod) this.timer = 0;
            this.timer++;
        }
    }

    GetBoundsDepth() : Vector2
    {
        return new Vector2(-((this.height - 1) * CELL_DEPTH) / 2, ((this.height - 1) * CELL_DEPTH) / 2);
    }

    GetBoundsWidth() : Vector2
    {
        return new Vector2(-((this.width - 1) * CELL_WIDTH) / 2, ((this.width - 1) * CELL_WIDTH) / 2);
    }

    GetWorldFromBoardSpace(x: number, z: number) : Vector3
    {
        const worldX = (x - (this.width / 2)) * CELL_WIDTH;
        const worldZ = (z - (this.height / 2)) * CELL_DEPTH;

        return new Vector3(worldX, 0, worldZ);
    }

    public FindAround(x: number, z: number, range: number, type: string, returnOccupied: boolean): Array<Mesh> {
        let foundPositions = [];

        const tabuleiro = this;
        for (let xp = -range; xp <= range; xp++) {
            for (let zp = -range; zp <= range; zp++) {
                if (xp === 0 && zp === 0) continue;
                let nomr1Dist = Math.abs(zp) + Math.abs(xp);

                if (nomr1Dist <= range) {
                    let celula = this.cells.find(function (e) {
                        if (e.metadata) {
                            if (e.metadata.type === type) {
                                if (e.metadata.x === x + xp && e.metadata.z === z + zp) {
                                    if (returnOccupied) return true;
                                    if(!tabuleiro.GetEntityAtCell(x + xp, z + zp)) return true;
                                }
                                else return false;
                            }
                            else return false;
                        }
                        else return false;
                    });

                    if (celula) foundPositions.push(celula);
                }
            }
        }

        return foundPositions;
    }

    HighlightCells(x: number, z: number, range: number): void
    {
        let highlightPositions = this.FindAround(x, z, range, "cell", false);

        for (let p in highlightPositions) {
            this.highlightedCells.push(highlightPositions[p]);
        }
    }

    UnHighlightCells(): void {
        for (let k = 0; k < this.highlightedCells.length; k++) {
            let cell = this.highlightedCells[k];
            let material = cell.material as StandardMaterial;

            material.emissiveColor = new Color3(0,0,0);
        }

        this.highlightedCells = [];
    }

    isCellHighlighted(x: number, z: number): boolean {
        const tabuleiro = this;
        let celula = this.highlightedCells.find(function (e) {
            if (e.metadata) {
                if (e.metadata.type === "cell") {
                    if (e.metadata.x === x && e.metadata.z === z) {
                        return true;
                    }
                    else return false;
                }
                else return false;
            }
            else return false;
        }); 

        if (celula) return true;
        else return false;
    }

    SelectCell(width: number, height: number) : void
    {
        
    }

    public FindEntitiesOfType(type: string): Array<Entity> {
        let returnedEntities = [];
        for (let e in this.entities) {
            let entity = this.entities[e];

            if (entity) {
                if (entity.GetType() === type) returnedEntities.push(entity);
            }
        }

        return returnedEntities;
    }

    GetCellCenterPosition(x: number, z: number) : Vector3
    {
        const sceneX = (x * CELL_WIDTH) - (CELL_WIDTH * this.width / 2);
        const sceneZ = (z * CELL_DEPTH) - (CELL_DEPTH * this.height / 2);

        return new Vector3(sceneX, 0, sceneZ);
    }

    GetEntityAtCell(x: number, z: number) : Entity | null
    {
        return this.entities[x + (this.width * z)];
    }

    SetEntityToCell(entity: Entity, x: number, z: number) : void
    {
        this.entities[x + (this.width * z)] = entity;
    }

    RemoveEntityFromCell(x: number, z: number): void
    {
        this.entities[x + (this.width * z)] = null;
    }

    FitPositionToCell(position: Vector3) : Vector3 
    {
        var bestFit = new Vector3(0, 0, 0);
        var lastDistance = 1000000;

        for (let index = 0; index < this.cells.length; index++) {
            const element = this.cells[index];
            const distance = element.position.subtract(position);
            
            if(distance.length() < lastDistance)
            {
                lastDistance = distance.length();
                bestFit = element.position;
            }
            
        }

        return bestFit;
    }
}