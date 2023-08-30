import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Game } from "./Game/game";

const levelsArray = ["level0", "level1", "level2"];
let currentLevel = 0;

class App {
    constructor(canvas: HTMLCanvasElement) {
        // initialize babylon scene and engine
        var engine = new BABYLON.Engine(canvas, true);
        var game = new Game(engine, canvas);

        window.addEventListener("resize", () => {
            engine.resize();
        });

        const firstLevel = levelsArray[currentLevel];

        if (firstLevel != undefined) {
            game.StartLevel(firstLevel).then(function (): void {
                // run the main render loop
                engine.runRenderLoop(() => {
                    game.Update(engine.getDeltaTime() / 1000);

                    if (game.ShouldEndLevel()) {
                        currentLevel++;

                        const nextLevel = levelsArray[currentLevel];

                        if (currentLevel < levelsArray.length && nextLevel != undefined) 
                        {
                            game.LoadNewLevel(nextLevel);
                        }
                        else {
                            game.ShowEndGameScreen();
                        }
                    }
                });
            });
        }


    }
}



export function initialize(canvas: HTMLCanvasElement): void {
    new App(canvas);
}