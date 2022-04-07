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
	instantiate,
	BoxCollider2D,
	Contact2DType,
	Collider2D,
	Intersection2D,
	EventTarget,
	find
} from 'cc';
const { ccclass, property, float, integer, requireComponent } = _decorator;

import { CELL_SIZE, UP, RIGHT, DOWN, LEFT, EPSILON, Routable, getNodeStartPosition, getNodeDestination, getNodeCurrentDirection, colliderToRect } from './common';
import { Tail } from './Tail';
import { Trail } from './Trail';
import { Type, ObjectType } from './Type';
import { Fruit } from './Fruit';
import { Manager } from './Manager';

export enum ControllerEvent {
	FRUIT_REQUEST = 'fruit-request',
	OBSTACLE_REQUEST = 'obstacle-request',
	SCORE_UPDATED = 'score-updated',
	STOPPED = 'stopped'
}

@ccclass('Controller')
@requireComponent(BoxCollider2D)
export class Controller extends Component implements Routable {
	@float
	baseSpeed: CCFloat = 128; // px/sec
	private step: CCFloat = CELL_SIZE; // px
	private speed: CCFloat = 0;

	@integer
	startSize: CCInteger = 3;

	@property(Prefab)
	tailPrefab: Prefab|null = null;

	@property(Node)
	tailTrail: Node|null = null;

	eventTarget: EventTarget = new EventTarget();

	@property({type: CCInteger, visible: false})
	score: CCInteger = 0;

	private stopped: boolean = true;
	private trail: Trail;
	private lastTail: Node|null = null;
	private pendingTail: Node|null = null;

	private direction: Vec2 = new Vec2(UP);
	private directionRotationZ: CCFloat = 0;
	private destination: Vec2 = new Vec2(0, 0);
	private startPosition: Vec2 = new Vec2(0, 0);
	private movingTime: CCFloat = 0;
	private managerNode: Node;

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
		this.managerNode = find('Manager');
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	onDestroy() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
	}

	start() {
		this.speed = this.baseSpeed;
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

		const unclamped = this.movingTime + deltaTime * (this.speed / this.step);
		this.movingTime = clamp01(unclamped);
		if (this.isDestinationReached()) {
			this.startPosition = new Vec2(this.destination);
			Vec2.scaleAndAdd(this.destination, this.startPosition, this.direction, this.step);
			this.movingTime = unclamped > this.movingTime ? unclamped - this.movingTime : 0;
			this.lookToDirection();

			this.forEachTail((tail: Tail) => {
				tail.finishRoute();
			});
		}

		const position: Vec2 = new Vec2(0, 0);
		Vec2.lerp(position, this.startPosition, this.destination, this.movingTime);
		this.node.setWorldPosition(new Vec3(position.x, position.y, 0));

		if (this.lastTail) {
			this.forEachTail((tail: Tail) => {
				tail.updatePosition(this.movingTime);
			});
			this.drawTrail();
		}

		this.detectCollision();
	}

	getTailStack(): Tail[] {
		const stack = [];
		if (!this.lastTail) {
			return stack;
		}

		let tail: Tail|null = this.lastTail.getComponent(Tail);
		while (tail) {
			stack.push(tail);
			tail = tail.parentPart.getComponent(Tail);
		}

		return stack;
	}

	// from head to last
	forEachTail(fn: (tail: Tail) => void) {
		const stack = this.getTailStack();
		let tail: Tail;
		while (tail = stack.pop()) {
			fn(tail);
		}
	}

	detectCollision() {
		for (let sibling of this.node.parent.children) {
			if (sibling === this.node) {
				continue;
			}

			const collider: BoxCollider2D|null = sibling.getComponent(BoxCollider2D);
			const selfCollider: BoxCollider2D = this.node.getComponent(BoxCollider2D);
			if (collider && Intersection2D.rectRect(colliderToRect(selfCollider), colliderToRect(collider))) {
				this.onCollision(sibling, collider);
			}
		}
	}

	onCollision(node: Node, collider: BoxCollider2D) {
		const type = node.getComponent(Type);
		if (type === null) {
			return;
		}

		switch (type.type) {
			case ObjectType.FRUIT:
				const points = node.getComponent(Fruit).points;
				this.score += points;
				this.eventTarget.emit(ControllerEvent.SCORE_UPDATED, this.score);
				this.growBy(points);
				this.setSpeed(this.speed + this.baseSpeed * (node.getComponent(Fruit).speedUp / 100));
				node.destroy();
				this.eventTarget.emit(ControllerEvent.FRUIT_REQUEST);

				if (this.score % 5 === 0) {
					this.eventTarget.emit(ControllerEvent.OBSTACLE_REQUEST);
				}
				break;
			case ObjectType.OBSTACLE:
				this.setStopped(true);
				break;
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

	setSpeed(speed: CCFloat) {
		this.speed = speed;
	}

	setStopped(state: boolean) {
		this.stopped = state;
		if (state) {
			let scoreRecord = null;
			if (this.score > 0) {
				scoreRecord = this.managerNode.getComponent(Manager).registerScore(this.score);
			}
			this.eventTarget.emit(ControllerEvent.STOPPED, scoreRecord);
		}
	}

	growBy(growSize: CCInteger) {
		this.growTailByDirection(
			growSize,
			Vec2.negate(new Vec2(), getNodeCurrentDirection(this.lastTail ? this.lastTail : this.node))
		);
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
