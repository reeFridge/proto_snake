import {
	_decorator,
	Component,
	Node,
	Vec2,
	input,
	Input,
	EventKeyboard,
	KeyCode,
	Vec3,
	CCFloat,
	CCInteger,
	clamp01,
	Prefab,
	instantiate
} from 'cc';
const { ccclass, property, float, integer } = _decorator;

import { UP, RIGHT, DOWN, LEFT, EPSILON, Routable, getNodeStartPosition, getNodeDestination, getNodeCurrentDirection } from './common';
import { Tail } from './Tail';
import { Trail } from './Trail';

@ccclass('Controller')
export class Controller extends Component implements Routable {
	@float
	speed: CCFloat = 128; // px/sec

	@float
	step: CCFloat = 64; // px

	@integer
	startSize: CCInteger = 3;

	@property(Prefab)
	tailPrefab: Prefab|null = null;

	@property(Node)
	tailTrail: Node|null = null;

	private started: boolean = false;
	private stopped: boolean = true;
	private trail: Trail;
	private lastTail: Node|null = null;
	private pendingTail: Node|null = null;

	private direction: Vec2 = new Vec2(UP);
	private directionRotationZ: CCFloat = 0;
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

	onLoad() {
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	onDestroy() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	start() {
		this.trail = this.tailTrail.getComponent(Trail);
		const position: Vec3 = new Vec3();
		this.node.getWorldPosition(position);
		this.startPosition.x = position.x;
		this.startPosition.y = position.y;
		Vec2.scaleAndAdd(this.destination, this.startPosition, this.direction, this.step);
		this.movingTime = 0;

		if (this.startSize > 1) {
			this.growTailByDirection(this.startSize - 1, DOWN);
		}
	}

	isDestinationReached() {
		return Math.abs(this.movingTime - 1) < EPSILON;
	}

	update(deltaTime: number) {
		if (this.stopped) {
			if (this.lastTail) {
				this.drawTrail();
			}
			return;
		}

		this.movingTime = clamp01(this.movingTime + deltaTime * (this.speed / this.step));
		if (this.isDestinationReached()) {
			this.startPosition = new Vec2(this.destination);
			Vec2.scaleAndAdd(this.destination, this.startPosition, this.direction, this.step);
			this.movingTime = 0;
			this.lookToDirection();
		}

		const position: Vec2 = new Vec2(0, 0);
		Vec2.lerp(position, this.startPosition, this.destination, this.movingTime);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));

		if (this.lastTail) {
			this.drawTrail();
		}
	}

	drawTrail() {
		let tail: Tail|null = this.lastTail.getComponent(Tail);
		// clear
		this.trail.begin();
		// batch canvas calls
		while (tail) {
			this.trail.pushSegment(tail);
			tail = tail.parentPart.getComponent(Tail);
		}
		// draw all segments
		this.trail.finish();
	}

	setStopped(state: boolean) {
		this.stopped = state;
		let tail: Tail|null = this.lastTail.getComponent(Tail);
		while (tail) {
			tail.setStopped(state);
			tail = tail.parentPart.getComponent(Tail);
		}
	}

	isStopped() {
		return this.stopped;
	}

	growTailByDirection(growSize: CCInteger, growDirection: Vec2) {
		for (let i = 0; i < growSize; ++i) {
			const tailNode = instantiate(this.tailPrefab);

			const parent: Node = this.lastTail ? this.lastTail : this.node;
			tailNode.getComponent(Tail).parentPart = parent;
			tailNode.getComponent(Tail).head = this.node;
			tailNode.parent = this.node.parent;

			const parentStartPosition = getNodeStartPosition(parent);
			const initPosition = Vec2.scaleAndAdd(new Vec2(), parentStartPosition, growDirection, this.step);
			const initDestination = parentStartPosition;

			tailNode.getComponent(Tail).setStopped(this.isStopped());
			tailNode.getComponent(Tail).initRoute(
				initPosition,
				initDestination,
				this.movingTime
			);

			this.lastTail = tailNode;
		}
	}

	onKeyDown(event: EventKeyboard) {
		const currentDirection: Vec2 = this.getCurrentDirection();

		switch (event.keyCode) {
			case KeyCode.SPACE:
				if (!this.started || this.stopped) {
					return;
				}
				this.growTailByDirection(
					1,
					Vec2.negate(new Vec2(), getNodeCurrentDirection(this.lastTail ? this.lastTail : this.node))
				);
				break;
			case KeyCode.KEY_W:
				if (Vec2.equals(DOWN, currentDirection)) {
					return;
				}
				this.direction = new Vec2(UP);
				this.directionRotationZ = 0;
				break;
			case KeyCode.KEY_A:
				if (Vec2.equals(RIGHT, currentDirection)) {
					return;
				}
				this.direction = new Vec2(LEFT);
				this.directionRotationZ = 90;
				break;
			case KeyCode.KEY_S:
				if (Vec2.equals(UP, currentDirection)) {
					return;
				}
				this.direction = new Vec2(DOWN);
				this.directionRotationZ = 180;
				break;
			case KeyCode.KEY_D:
				if (Vec2.equals(LEFT, currentDirection)) {
					return;
				}
				this.direction = new Vec2(RIGHT);
				this.directionRotationZ = 270;
				break;
			default:
				return;
		}

		if (!this.started) {
			this.started = true;
			this.setStopped(false);
		}
	}

	lookToDirection() {
		this.node.setRotationFromEuler(0, 0, this.directionRotationZ);
	}
}