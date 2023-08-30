import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { AnimCreator } from "./animCreator";
import { Board } from "./board";

const CURSOR_BASE_HEIGHT = 0.5;

export class Cursor
{
    private board : Board;
    private camera : Camera;
    private scene : Scene;
    private mesh: Mesh;
    private animationGroupLow: AnimationGroup;
    private animationGroupHigh: AnimationGroup;
    private transformNode: TransformNode;
    private overEntity: boolean;
    private overCell: boolean;
    private overX: number;
    private overZ: number;
    private fixed: boolean;

    constructor(board: Board, scene: Scene, camera: Camera, mesh: Mesh)
    {
      this.board = board;
      this.scene = scene;
      this.camera = camera;
      this.mesh = mesh;
      this.animationGroupLow = new AnimationGroup("Cursor");
      this.animationGroupHigh = new AnimationGroup("Cursor");
      
      this.CreateUpDownAnimation(CURSOR_BASE_HEIGHT, CURSOR_BASE_HEIGHT + 0.5, this.animationGroupLow);
      this.CreateUpDownAnimation(CURSOR_BASE_HEIGHT + 1, CURSOR_BASE_HEIGHT + 1.5, this.animationGroupHigh);

      this.transformNode = new TransformNode("CursorRoot");
      this.mesh.setParent(this.transformNode, true);
      this.mesh.rotation = new Vector3(Math.PI, 0, 0);

      this.animationGroupLow.play(true);
      
      this.overEntity = false;
      this.overCell = false;
      this.overX = 0;
      this.overZ = 0;
      this.fixed = false;
    }

    private CreateUpDownAnimation(base: number, top: number, animgroup: AnimationGroup): void {
        animgroup.addTargetedAnimation(AnimCreator.CreateUpDownAnimation(base, top, 2), this.mesh);
    }
  
    getCursorOverEntity(): boolean {
      return this.overEntity;
    }
  
    getCursorOverCell(): boolean{
      return this.overCell;
    }
  
    getCursorOverPos(): Vector2 {
      return new Vector2(this.overX, this.overZ);
    }
  
    fixCursor(): void{
      this.fixed = true;
    }
  
    unfixCursor(): void {
      this.fixed = false;
    }
  
    moveCursorTo(x: number, z: number, tall: boolean): void {
      let pos = this.board.GetCellCenterPosition(x, z);
      this.transformNode.setAbsolutePosition(pos);

      if (tall) {
        this.animationGroupHigh.play(true);
        this.animationGroupLow.stop();
      }
      else {
        this.animationGroupLow.play(true);
        this.animationGroupHigh.stop();
      }
    }
 
    Update() : void
    {
        var ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.camera, false);	
        var pickResult = this.scene.pickWithRay(ray);

        if (pickResult.hit == true)
        {
          if (!this.fixed) {
            var worldPoint = pickResult.pickedPoint;
            let finalPosition = this.board.FitPositionToCell(worldPoint);
            this.transformNode.setAbsolutePosition(finalPosition);
          }

          if (!pickResult) return;
          if (!pickResult.pickedMesh) return;
          if (!pickResult.pickedMesh.metadata) return;
          if (!pickResult.pickedMesh.metadata.type) return;

          let metadataResultante = pickResult.pickedMesh.metadata;
          let supostaEntity = this.board.GetEntityAtCell(metadataResultante.x, metadataResultante.z);

          if ((typeof(supostaEntity) === "object" && supostaEntity != undefined && supostaEntity != null) || metadataResultante.type != "cell") {
            if (!this.fixed) {
              this.animationGroupLow.stop();
              this.animationGroupHigh.play(true);
            }

            this.overEntity = true;
            this.overCell = false;
            this.overX = metadataResultante.x;
            this.overZ = metadataResultante.z;
          }
          else {
            if (!this.fixed) {
              this.animationGroupHigh.stop();
              this.animationGroupLow.play(true);
            }
            this.overEntity = false;
            if (metadataResultante.type === "cell") {
              this.overCell = true;
              this.overX = metadataResultante.x;
              this.overZ = metadataResultante.z;
            }
          }
        }       
    }
}