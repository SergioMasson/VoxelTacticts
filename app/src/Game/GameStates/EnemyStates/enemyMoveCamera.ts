import { Board } from "../../board";
import { GameState } from "../state";
import * as BABYLON from "@babylonjs/core";

const FOCUS_SPEED = 2;
const FOCUS_RADIUS = 8;
const FOCUS_ALPHA = Math.PI / 4;
const FOCUS_BETHA = Math.PI / 3;

export class EnemyMoveCamera implements GameState
{
    private stateData: Array<Number>;
    private camera: BABYLON.ArcRotateCamera;
    private board: Board;
    private shouldEnd: boolean;

    private initialTarget: BABYLON.Vector3;
    private finalTarget: BABYLON.Vector3;

    private initialRaius: number;
    private finalRadius: number;

    private initialAlpha: number;
    private finalAlpha: number;

    private initialBeta: number;
    private finalBeta: number;

    private progress: number;

    constructor(board: Board, camera: BABYLON.ArcRotateCamera)
    {
        this.board = board;
        this.camera = camera;
        this.shouldEnd = false;
    }

    Start(state: Array<Number>): void 
    {
        this.stateData = state;
        const x = state[0] as number;
        const z = state[1] as number;
        
        this.finalTarget = this.board.GetWorldFromBoardSpace(x, z);
        this.initialTarget = this.camera.target;
        this.progress = 0;
        this.shouldEnd = false;
        this.initialRaius = this.camera.radius;
        this.finalRadius = FOCUS_RADIUS;

        this.initialAlpha = this.camera.alpha;
        this.finalAlpha = FOCUS_ALPHA;

        this.initialBeta = this.camera.beta;
        this.finalBeta = FOCUS_BETHA;
    }

    End(): Array<Number> 
    {
        return this.stateData;
    }

    Update(deltaT : number): void 
    {
        if(this.progress < 1)
        {
            this.progress += deltaT * FOCUS_SPEED;

            const newTarget = BABYLON.Vector3.Lerp(this.initialTarget, this.finalTarget, this.progress)
            this.camera.setTarget(newTarget);
            
            this.camera.radius = (this.finalRadius * this.progress) + (this.initialRaius * (1 - this.progress));
            this.camera.alpha = (this.finalAlpha * this.progress) + (this.initialAlpha * (1 - this.progress));
            this.camera.beta = (this.finalBeta * this.progress) + (this.initialBeta * (1 - this.progress));

            return;
        }
        
        this.camera.setTarget(this.finalTarget);
        this.shouldEnd = true;
    }

    ShouldEnd(): boolean 
    {
        return this.shouldEnd;
    }

}