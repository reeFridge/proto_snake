import { _decorator, Component, Node, game, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Manager')
export class Manager extends Component {
	onLoad() {
		game.addPersistRootNode(this.node);
	}

	reloadScene() {
		director.loadScene('MainScene');
	}
}
