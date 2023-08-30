import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { AnimCreator } from "./animCreator";
import { Board } from "./board";

export enum LookDirection
{
    Z_PLUS,
    Z_MINUS,
    X_PLUS,
    X_MINUS
}

// Base class for players and enemies. 
export class Entity 
{
    private mainBoard : Board;
    private instanceMesh: InstancedMesh;
    private boardPosition: Vector2;
    private moveRange: number;
    private attackRange: number;
    private startHealth: number;
    private health: number;
    private attackPoints: number;
    private transformNode: TransformNode;
    private type: string;
    private healthBar: Mesh;
    private isBlocking: boolean;
    private blockShield: InstancedMesh;

    private attackAnim: AnimationGroup;

    constructor(board : Board, rootMesh: Mesh, type: string, maxHealth: number, attackPoints: number, attackRange: number, range: number, shield: Mesh) 
    {
        this.mainBoard = board;
        this.instanceMesh = rootMesh.createInstance("entity");
        this.instanceMesh.metadata = { type: "entity", x: 0, z: 0};
        this.moveRange = range;
        this.attackRange = attackRange;

        this.blockShield = shield.createInstance("entity_shield");
        this.transformNode = new TransformNode("EntityRoot");
        this.instanceMesh.setParent(this.transformNode, true);
        this.blockShield.setParent(this.transformNode, true);
        this.blockShield.position.y = -10000000;
        this.blockShield.rotation = new Vector3(0, 0, 0);

        this.instanceMesh.metadata = {
            type: type,
            x: 0,
            z: 0
        };

        var plane = MeshBuilder.CreatePlane("plane", {
            sideOrientation: Mesh.DOUBLESIDE,
            width: 0.25,
            height: 0.125
        });
        plane.parent = this.transformNode;
        plane.position.y = 1;

        this.startHealth = maxHealth;
        this.health = this.startHealth;
        this.attackPoints = attackPoints;

        let material = new StandardMaterial("")
        plane.material = material;
        material.emissiveColor = new Color3(0.7, 0.2, 0.2);

        this.healthBar = plane;

        this.attackAnim = new AnimationGroup("");
        this.attackAnim.addTargetedAnimation(AnimCreator.CreateUpDownAnimation(0, 1, 0.5), this.instanceMesh);

        this.isBlocking = false;
    }


    public CanMove(x: number, z: number) : boolean
    {
        return true;
    }

    public getEntityBoardPos(): Vector2 {
        return this.boardPosition;
    }

    public SetPosition(x: number, z: number) : void
    {
        if(this.boardPosition) this.mainBoard.RemoveEntityFromCell(this.boardPosition.x, this.boardPosition.y);
        this.mainBoard.SetEntityToCell(this, x, z);
        const position = this.mainBoard.GetCellCenterPosition(x, z);

        this.transformNode.setAbsolutePosition(position);
        this.boardPosition = new Vector2(x, z);
        this.instanceMesh.metadata.x = this.boardPosition.x;
        this.instanceMesh.metadata.z = this.boardPosition.y;
    }

    public animatedMove(x: number, z: number): void {

    }

    public SetLookDirection(forward: LookDirection)
    {
        switch(forward)
        {
            case LookDirection.X_MINUS:
                this.instanceMesh.rotation = new Vector3(0, 0, 0);
                break;

            case LookDirection.X_PLUS:
                this.instanceMesh.rotation = new Vector3(0, Math.PI, 0);
                break;

            case LookDirection.Z_MINUS:
                this.instanceMesh.rotation = new Vector3(0, Math.PI / 2, 0);
                break;

            case LookDirection.Z_PLUS:
                this.instanceMesh.rotation = new Vector3(0,  - Math.PI / 2, 0);
                break;
        }
    }

    public GetBoardPosition() :  Vector2
    {
        return this.boardPosition;
    }

    public GetRange() : number {
        return this.moveRange;
    }

    public GetAttackRange(): number {
        return this.attackRange;
    }

    public GetType(): string {
        return this.instanceMesh.metadata.type;
    }

    public GetAttackPoints(): number {
        return this.attackPoints;
    }

    public PlayAttackAnim(): void {
        this.attackAnim.play();
    }

    public IsAnimating(): boolean {
        return this.attackAnim.isPlaying;
    }

    public IsBlocking(): boolean {
        return this.isBlocking;
    }

    public Block(): void {
        this.isBlocking = true;
        this.blockShield.position.y = 1.2;
    }

    public Unblock(): void {
        this.isBlocking = false;
        this.blockShield.position.y = -10000;
    }

    public InflictDamage(amount: number): void {
        this.health -= amount;

        if (this.health > 0) {
            this.healthBar.scaling.x = this.health / this.startHealth;
        }
        else {
            this.mainBoard.RemoveEntityFromCell(this.boardPosition.x, this.boardPosition.y);
            this.healthBar.dispose();
            this.instanceMesh.dispose();
            this.blockShield.dispose();
        }
    }
}