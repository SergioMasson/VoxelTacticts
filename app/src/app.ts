import { Engine } from "@babylonjs/core/Engines/engine";
import { Game } from "./Game/game";

const levelsArray = ["level0", "level1", "level2"];
let currentLevel = 0;

class App {
    constructor(canvas: HTMLCanvasElement) {
        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var game = new Game(engine, canvas);

        window.addEventListener("resize", () => {
            engine.resize();
        });

        const firstLevel = levelsArray[currentLevel];

        if (firstLevel != undefined) {
            game.StartLevel(firstLevel);

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
        }


    }
}



export function initialize(canvas: HTMLCanvasElement): void {
    new App(canvas);
}