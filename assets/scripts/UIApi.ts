import { _decorator, Component, Node, CCInteger, Label, Widget, EventTarget, Button, find } from 'cc';
const { ccclass, property } = _decorator;

import { ControllerEvent, Controller } from './Controller';
import { MapGeneratorEvent, MapGenerator } from './MapGenerator';
import { Manager } from './Manager';

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

	@property(Node)
	restart: Node;

	private managerNode: Node;

	onLoad() {
		this.managerNode = find('Manager');
		this.headNode.getComponent(Controller).eventTarget.on(ControllerEvent.STOPPED, this.onGameOver, this);
		this.headNode.getComponent(Controller).eventTarget.on(ControllerEvent.SCORE_UPDATED, this.updateScore, this);
		this.worldNode.getComponent(MapGenerator).eventTarget.on(MapGeneratorEvent.ROCKS_UPDATED, this.updateRocks, this);
		this.restart.on('click', this.onRestartClick, this);
	}

	private updateLabel(node: Node, count: CCInteger, textGenerator: (count: CCInteger) => string) {
		node.getComponent(Label).string = textGenerator(count);
		node.getComponent(Widget).updateAlignment();
	}

	onGameOver() {
		this.restart.active = true;
	}

	onRestartClick() {
		this.managerNode.getComponent(Manager).reloadScene();
	}

	updateRocks(count: CCInteger) {
		this.updateLabel(this.rocksNode, count, generateRocksText);
	}

	updateScore(score: CCInteger) {
		this.updateLabel(this.scoreNode, score, generateScoreText);
	}
}
