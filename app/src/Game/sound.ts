import { AudioSceneComponent } from "@babylonjs/core/Audio/audioSceneComponent";
import { Sound } from "@babylonjs/core/Audio/sound";
import { Scene } from "@babylonjs/core/scene";

export class GameSound
{ 
	private attackSfx: Sound;
	private select1: Sound;
	private select2: Sound;
	private move: Sound;

	private layer1: Sound;
	private layer2: Sound;
	private layer3: Sound;

	private audioComponent : AudioSceneComponent;

	constructor(scene: Scene) {
		this.audioComponent = new AudioSceneComponent(scene);
		this.attackSfx = new Sound("Attack_sfx", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/attack.wav", scene, function () { });
		this.select1 = new Sound("Select1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/select1.wav", scene, function () { });
		this.select2 = new Sound("Select1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/select2.wav", scene, function () { });
		this.move = new Sound("Move", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/sfx/move.wav", scene, function () { });
		
		let layersReady = 0;

		this.layer1 = new Sound("layer1", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer1.wav", scene, soundReady, { loop: true, autoplay: false });
		this.layer2 = new Sound("layer2", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer2.wav", scene, soundReady, { loop: true, autoplay: false });
		this.layer3 = new Sound("layer3", "https://raw.githubusercontent.com/SergioMasson/GAMUX-LIVRE-GAME-JAM/main/public/songs/layer3.wav", scene, soundReady, { loop: true, autoplay: false });

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