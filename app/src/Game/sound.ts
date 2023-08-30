import * as BABYLON from "@babylonjs/core";

export class Sound
{ 
	private attackSfx: BABYLON.Sound;
	private select1: BABYLON.Sound;
	private select2: BABYLON.Sound;
	private move: BABYLON.Sound;

	private layer1: BABYLON.Sound;
	private layer2: BABYLON.Sound;
	private layer3: BABYLON.Sound;

	constructor(scene: BABYLON.Scene) {
		this.attackSfx = new BABYLON.Sound("Attack_sfx", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/attack.wav", scene, function () { });
		this.select1 = new BABYLON.Sound("Select1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/select1.wav", scene, function () { });
		this.select2 = new BABYLON.Sound("Select1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/select2.wav", scene, function () { });
		this.move = new BABYLON.Sound("Move", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/move.wav", scene, function () { });
		
		let layersReady = 0;

		this.layer1 = new BABYLON.Sound("layer1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer1.wav", scene, soundReady, { loop: true, autoplay: false });
		this.layer2 = new BABYLON.Sound("layer2", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer2.wav", scene, soundReady, { loop: true, autoplay: false });
		this.layer3 = new BABYLON.Sound("layer3", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer3.wav", scene, soundReady, { loop: true, autoplay: false });

		this.layer1.setVolume(2);
		this.layer2.setVolume(0);
		this.layer3.setVolume(0);
		
		let soundPlayer = this;

		function soundReady() {
			layersReady++;

			if (layersReady === 3) {
				soundPlayer.layer1.play();
				soundPlayer.layer2.play();
				soundPlayer.layer3.play();
			}
		}

		let efeitos = this;
	}

	public MuteMusic(): void {
		this.layer1.setVolume(0);
		this.layer2.setVolume(0);
		this.layer3.setVolume(0);
	}

	public Layer1(): void {
		this.layer1.setVolume(2);
		this.layer2.setVolume(0);
		this.layer3.setVolume(0);
	}

	public Layer2(): void {
		this.layer1.setVolume(2);
		this.layer2.setVolume(2);
		this.layer3.setVolume(0);
	}

	public Layer3(): void {
		this.layer1.setVolume(2);
		this.layer2.setVolume(2);
		this.layer3.setVolume(2);
	}

	public AttackSound(): void {
		this.attackSfx.play();
	}

	public MoveSound(): void {
		this.move.play();
	}

	public SelectSound(): void {
		let qual = Math.random() > 0.5;
		
		if (qual) this.select1.play();
		else this.select2.play();
	}
}