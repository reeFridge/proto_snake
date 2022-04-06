import { _decorator, Component, Node, CCInteger, Label, Widget } from 'cc';
const { ccclass, property } = _decorator;

import { ControllerEvent, Controller } from './Controller';
import { MapGeneratorEvent, MapGenerator } from './MapGenerator';

function generateScoreText(score: CCInteger): string {
	return `SCORE [ ${score} ]`;
}

function generateRocksText(count: CCInteger): string {
	return `[ ${count} ] ROCKS`;
}

@ccclass('UIApi')
export class UIApi extends Component {
	@property(Node)
	scoreNode: Node;

	@property(Node)
	rocksNode: Node;

	@property(Node)
	headNode: Node;

	@property(Node)
	worldNode: Node;

	onLoad() {
		this.headNode.getComponent(Controller).eventTarget.on(ControllerEvent.SCORE_UPDATED, this.updateScore, this);
		this.worldNode.getComponent(MapGenerator).eventTarget.on(MapGeneratorEvent.ROCKS_UPDATED, this.updateRocks, this);
	}

	private updateLabel(node: Node, count: CCInteger, textGenerator: (count: CCInteger) => string) {
		node.getComponent(Label).string = textGenerator(count);
		node.getComponent(Widget).updateAlignment();
	}

	updateRocks(count: CCInteger) {
		this.updateLabel(this.rocksNode, count, generateRocksText);
	}

	updateScore(score: CCInteger) {
		this.updateLabel(this.scoreNode, score, generateScoreText);
	}
}
