import { _decorator, Component, Node, Prefab, CCInteger, Vec2, Vec3, instantiate, randomRangeInt } from 'cc';
const { ccclass, property, integer } = _decorator;

import { ControllerEvent, Controller } from './Controller';
import { CELL_SIZE } from './common';

@ccclass('MapGenerator')
export class MapGenerator extends Component {
	@integer
	width: CCInteger = 10;

	@integer
	height: CCInteger = 10;

	@property(Prefab)
	obstaclePrefab: Prefab;

	@property(Prefab)
	fruitPrefab: Prefab;

	@property(Node)
	head: node;

	spawnFruit(position: Vec2) {
		const node = instantiate(this.fruitPrefab);
		node.parent = this.node;
		node.setPosition(new Vec3(position.x, position.y, 0));
	}

	spawnFruitAtRandomPosition() {
		this.spawnFruit(new Vec2(
			randomRangeInt(0, this.width - 1) * CELL_SIZE - CELL_SIZE * this.width / 2,
			randomRangeInt(0, this.height - 1) * CELL_SIZE - CELL_SIZE * this.height / 2
		));
	}

	spawnObstacle(width: CCInteger, height: CCInteger, position: Vec2) {
		const node = instantiate(this.obstaclePrefab);
		node.parent = this.node;
		node.setPosition(new Vec3(position.x, position.y, 0));
	}

	start() {
		const controller: Controller = this.head.getComponent(Controller);
		controller.eventTarget.on(ControllerEvent.FRUIT_REQUEST, this.onFruitRequest, this);

		this.spawnFruitAtRandomPosition();
	}

	onFruitRequest() {
		this.spawnFruitAtRandomPosition();
	}
}
