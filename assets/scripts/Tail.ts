import { _decorator, Component, Node, Vec2, CCFloat, Vec3, clamp01 } from 'cc';
const { ccclass, property, float } = _decorator;

import { EPSILON, UP, Routable, getNodeStartPosition } from './common';
import { Controller } from './Controller';

@ccclass('Tail')
export class Tail extends Component implements Routable {
	@float
	speed: CCFloat = 128; // px/sec

	@float
	step: CCFloat = 64; // px

	@property(Node)
	parentPart: Node;

	@property(Node)
	head: Node;

	private stopped: boolean = true;

	private destination: Vec2 = new Vec2(0, 0);
	private startPosition: Vec2 = new Vec2(0, 0);
	private movingTime: CCFloat = 0;

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
		this.movingTime = t;

		const position = Vec2.lerp(new Vec2(), start, end, t);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));
	}

	isDestinationReached() {
		return Math.abs(this.movingTime - 1) < EPSILON;
	}

	setStopped(state: boolean) {
		this.stopped = state;
	}

	update(deltaTime: number) {
		if (this.stopped) {
			return;
		}

		this.movingTime = clamp01(this.movingTime + deltaTime * (this.speed / this.step));
		if (this.isDestinationReached()) {
			this.startPosition = new Vec2(this.destination);
			const destination = getNodeStartPosition(this.parentPart);
			if (destination) {
				this.destination = destination;
			}
			this.movingTime = 0;
		}

		const position: Vec2 = new Vec2(0, 0);
		Vec2.lerp(position, this.startPosition, this.destination, this.movingTime);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));

		this.checkHeadCollision(position);
	}

	checkHeadCollision(selfPosition: Vec2) {
		const distanceSqr = Vec2.squaredDistance(this.head.getWorldPosition(new Vec3()) as Vec2, selfPosition);
		if (distanceSqr < (this.step * this.step) / 4) {
			const controller: Controller = this.head.getComponent(Controller);
			if (!controller.isStopped()) {
				controller.setStopped(true);
			}
		}
	}
}
