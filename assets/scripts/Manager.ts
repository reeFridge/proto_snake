import { _decorator, Component, Node, game, director, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

interface ScoreRecord {
	timestamp: CCInteger;
	score: CCInteger;
}

@ccclass('Manager')
export class Manager extends Component {
	private scoreRecords: ScoreRecord[] = [];

	onLoad() {
		game.addPersistRootNode(this.node);
	}

	reloadScene() {
		director.loadScene('MainScene');
		console.info('top scores', this.getLastTopRecords());
	}

	registerScore(score: CCInteger): ScoreRecord {
		const record = {timestamp: Date.now(), score: score};
		this.scoreRecords.push(record);
		return record;
	}

	getLastTopRecords(n: CCInteger = 5) {
		return this.scoreRecords
			.sort((a: ScoreRecord, b: ScoreRecord) => b.score - a.score)
			.slice(0, n);
	}
}
