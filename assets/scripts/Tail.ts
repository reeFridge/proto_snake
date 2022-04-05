import { _decorator, Component, Node, Vec2, CCFloat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { CELL_SIZE, Routable, getNodeStartPosition } from './common';
import { Controller } from './Controller';

@ccclass('Tail')
export class Tail extends Component implements Routable {
	@property(Node)
	parentPart: Node;

	@property(Node)
	head: Node;

	private destination: Vec2 = new Vec2(0, 0);
	private startPosition: Vec2 = new Vec2(0, 0);

	getDestination(): Vec2 {
		return new Vec2(this.destination);
	}

	getStartPosition(): Vec2 {
		return new Vec2(this.startPosition);
	}

	getCurrentDirection(): Vec2 {
		return Vec2.subtract(
			new Vec2(),
			this.destination,
			this.node.getWorldPosition(new Vec3()) as Vec2
		).normalize();
	}

	initRoute(start: Vec2, end: Vec2, t: CCFloat = 0) {
		this.startPosition.x = start.x;
		this.startPosition.y = start.y;
		this.destination.x = end.x;
		this.destination.y = end.y;

		const position = Vec2.lerp(new Vec2(), start, end, t);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));
	}

	// called from controller
	updatePosition(movingTime: number) {
		const position: Vec2 = new Vec2(0, 0);
		Vec2.lerp(position, this.startPosition, this.destination, movingTime);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));

		this.checkHeadCollision(position);
	}

	// called from controller
	finishRoute() {
		this.startPosition = new Vec2(this.destination);
		const destination = getNodeStartPosition(this.parentPart);
		if (destination) {
			this.destination = destination;
		}
	}

	checkHeadCollision(selfPosition: Vec2) {
		const distanceSqr = Vec2.squaredDistance(this.head.getWorldPosition(new Vec3()) as Vec2, selfPosition);
		if (distanceSqr < (CELL_SIZE * CELL_SIZE) / 4) {
			const controller: Controller = this.head.getComponent(Controller);
			controller.setStopped(true);
		}
	}
}
