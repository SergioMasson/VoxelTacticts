import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";

export class StartScreen
{
    Show(scene: Scene) : Promise<void>
    {      
        const promise = new Promise<void>(async (resolve, reject) => 
        {
            const UITexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
            const loadedGUI = await UITexture.parseFromURLAsync("./UI/startScreen.json");
            const playButton = loadedGUI.getControlByName("PlayButton") as Button;

            playButton.onPointerClickObservable.add(() => {
                resolve();       
            });
        });
        
        return promise;
    }
}