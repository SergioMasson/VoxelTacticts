import * as BABYLON from "@babylonjs/core";

export class AnimCreator {
	static CreateUpDownAnimation(base: number, top: number, duration: number): BABYLON.Animation {
		const frameRate = 30;
		const animDuration = duration * frameRate;   

		var jumpY = new BABYLON.Animation(
			"jumpY",
			"position.y",
			frameRate,
			BABYLON.Animation.ANIMATIONTYPE_FLOAT,
			BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);

		var jumpYKeys = [];

		jumpYKeys.push({
			frame: 0,
			value:  base
		});

		jumpYKeys.push({
			frame: 0.5 * animDuration,
			value: top
		});

		jumpYKeys.push({
			frame: 1 * animDuration,
			value: base
		});


		jumpY.setKeys(jumpYKeys);  
		return jumpY;
	}
}