import {
	_decorator,
	Component,
	Node,
	Prefab,
	CCInteger,
	Vec2,
	Vec3,
	instantiate,
	randomRangeInt,
	Intersection2D,
	BoxCollider2D,
	Rect,
	UITransform,
	Size,
	view,
	EventTarget,
	screen
} from 'cc';
const { ccclass, property, integer } = _decorator;

import { ControllerEvent, Controller } from './Controller';
import { Grid } from './Grid';
import { CELL_SIZE, colliderToRect } from './common';
import { FollowCamera } from './FollowCamera';

export enum MapGeneratorEvent {
	ROCKS_UPDATED = 'rocks-updated'
}

@ccclass('MapGenerator')
export class MapGenerator extends Component {
	@integer
	width: CCInteger = 10;

	@integer
	height: CCInteger = 10;

	@property(Prefab)
	obstaclePrefab: Prefab;

	@integer
	obstaclesOnStart: CCInteger = 2;

	@integer
	obstacleAreaPercent: CCInteger = 1;

	@property(Prefab)
	fruitPrefab: Prefab;

	@integer
	fruitsOnStart: CCInteger = 3;

	@property(Node)
	head: Node;

	@property(Node)
	grid: Node;

	@property(Node)
	cameraNode: Node;

	rocksCount: CCInteger = 0;

	eventTarget: EventTarget = new EventTarget();

	spawnFruit(position: Vec2) {
		const node = instantiate(this.fruitPrefab);
		node.parent = this.node;
		node.setPosition(new Vec3(position.x, position.y, 0));
	}

	spawnFruitAtRandomPosition() {
		let cell: Vec2 = this.generateRandomCell();

		// TODO: define exit condition (different from occupation check)
		while (this.isCellOccupied(cell)) {
			cell = this.generateRandomCell();
		}

		this.spawnFruit(new Vec2(
			cell.x * CELL_SIZE,
			cell.y * CELL_SIZE
		));
	}

	generateRandomCell(border: CCInteger = 0) {
		return new Vec2(randomRangeInt(border, this.width - border), randomRangeInt(border, this.height - border));
	}

	// area in cells
	generateRandomSize(area: CCInteger): Size|null {
		const divisors = [];
		for (let i = 1; i <= area; ++i) {
			if (area % i === 0) divisors.push(i);
		}

		if (!divisors.length) {
			return null;
		}

		const width = divisors[randomRangeInt(0, divisors.length)];
		return new Size(width, area / width);
	}

	spawnObstacle(width: CCInteger, height: CCInteger, positionCell: Vec2) {
		const node = instantiate(this.obstaclePrefab);
		const transform = node.getComponent(UITransform);
		const collider = node.getComponent(BoxCollider2D);
		const size: Size = new Size(width * CELL_SIZE, height * CELL_SIZE);
		transform.setContentSize(size);
		collider.size = size;
		node.parent = this.node;
		node.setPosition(new Vec3(
			positionCell.x * CELL_SIZE + (width * CELL_SIZE) / 2 - CELL_SIZE / 2,
			positionCell.y * CELL_SIZE + (height * CELL_SIZE) / 2 - CELL_SIZE / 2,
			0
		));
	}

	spawnRandomObstacle(areaPercent: CCFloat) {
		const area = this.width * this.height;
		const obstacleArea = Math.floor(area * areaPercent);
		const one = new Size(1, 1);

		let obstacleSize: Size = this.generateRandomSize(obstacleArea) || one;
		let cell: Vec2 = this.generateRandomCell(1);
		const freeAround = 1;
		const isOccupied = () => {
			const width = obstacleSize.width + freeAround * 2;
			const height = obstacleSize.height + freeAround * 2;
			const cellWithOffset = Vec2.subtract(new Vec2(), cell, new Vec2(freeAround, freeAround));
			return this.isAreaOccupied(width, height, cellWithOffset);
		};

		// TODO: define exit condition (different from occupation check)
		while (isOccupied()) {
			obstacleSize = this.generateRandomSize(obstacleArea) || one;
			cell = this.generateRandomCell(1);
		}

		this.spawnObstacle(obstacleSize.width, obstacleSize.height, cell);
		this.rocksCount++;
		this.eventTarget.emit(MapGeneratorEvent.ROCKS_UPDATED, this.rocksCount);
	}

	spawnEdges() {
		this.spawnObstacle(this.width, 1, new Vec2(0, -1));
		this.spawnObstacle(this.width, 1, new Vec2(0, this.height));
		this.spawnObstacle(1, this.height + 2, new Vec2(-1, -1));
		this.spawnObstacle(1, this.height + 2, new Vec2(this.width, -1));
	}

	start() {
		const screenSize = screen.windowSize;
		const screenSizeInCells = new Size(
			Math.floor(screenSize.width / CELL_SIZE),
			Math.floor(screenSize.height / CELL_SIZE)
		);
		this.width = screenSizeInCells.width * 2;
		this.height = screenSizeInCells.height * 2;
		console.info(`Game field size: ${this.width}x${this.height}`);
		this.grid.getComponent(Grid).drawGrid(this.width, this.height);

		const controller: Controller = this.head.getComponent(Controller);
		controller.eventTarget.on(ControllerEvent.FRUIT_REQUEST, this.onFruitRequest, this);
		controller.eventTarget.on(ControllerEvent.OBSTACLE_REQUEST, this.onObstacleRequest, this);

		const position = this.node.getWorldPosition(new Vec3());
		const worldRect = new Rect(
			position.x - CELL_SIZE - CELL_SIZE / 2,
			position.y - CELL_SIZE - CELL_SIZE / 2,
			(this.width + 2) * CELL_SIZE,
			(this.height + 2) * CELL_SIZE
		);
		this.cameraNode.getComponent(FollowCamera).setWorldRect(worldRect);

		this.spawnEdges();
		for (let i = 0; i < this.fruitsOnStart; ++i) {
			this.spawnFruitAtRandomPosition();
		}

		for (let i = 0; i < this.obstaclesOnStart; ++i) {
			this.spawnRandomObstacle(this.obstacleAreaPercent / 100);
		}
	}

	toLocalRect(rect: Rect): Rect {
		const position: Vec3 = this.node.getWorldPosition(new Vec3());
		const localRectPosition = Vec2.subtract(new Vec2(), new Vec2(rect.x, rect.y), position as Vec2);
		rect.x = localRectPosition.x;
		rect.y = localRectPosition.y;
		return rect;
	}

	isAreaOccupied(width: CCInteger, height: CCInteger, cell: Vec2): boolean {
		for (let childNode of this.node.children) {
			const collider: BoxCollider2D|null = childNode.getComponent(BoxCollider2D);
			const rect: Rect = new Rect(
				cell.x * CELL_SIZE - CELL_SIZE / 4,
				cell.y * CELL_SIZE - CELL_SIZE / 4,
				(CELL_SIZE / 2) * width + (CELL_SIZE / 2) * (width - 1),
				(CELL_SIZE / 2) * height + (CELL_SIZE / 2) * (height - 1),
			);
			if (collider && Intersection2D.rectRect(rect, this.toLocalRect(colliderToRect(collider)))) {
				return true;
			}
		}

		return false;
	}

	isCellOccupied(cell: Vec2): boolean {
		return this.isAreaOccupied(1, 1, cell);
	}

	onFruitRequest() {
		this.spawnFruitAtRandomPosition();
	}

	onObstacleRequest() {
		this.spawnRandomObstacle(this.obstacleAreaPercent / 100);
	}
}
