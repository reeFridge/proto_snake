import { _decorator, Component, Node, Graphics, Vec3, Vec2, CCFloat } from 'cc';
const { ccclass, property, requireComponent } = _decorator;
import { Tail } from './Tail';

@ccclass('Trail')
@requireComponent(Graphics)
export class Trail extends Component {
	private graphics: Graphics;

	start() {
		this.graphics = this.node.getComponent(Graphics);
	}

	begin() {
		this.graphics.clear();
		this.graphics.moveTo(0, 0);
	}

	finish() {
		this.graphics.stroke();
	}

	pushSegment(tail: Tail) {
		const headPosition: Vec3 = new Vec3();
		this.node.getWorldPosition(headPosition);

		const position: Vec3 = new Vec3();
		tail.node.getWorldPosition(position);

		const localPosition: Vec2 = Vec2.subtract(
			new Vec2(),
			position as Vec2,
			headPosition as Vec2
		);

		this.graphics.moveTo(localPosition.x, localPosition.y);

		const parentPosition: Vec3 = new Vec3();
		tail.parentPart.getWorldPosition(parentPosition);

		const localParentPosition: Vec2 = Vec2.subtract(
			new Vec2(),
			parentPosition as Vec2,
			position as Vec2
		);

		const localDestination: Vec2 = Vec2.subtract(
			new Vec2(),
			tail.getDestination(),
			position as Vec2
		);

		const angle: CCFloat = Vec2.angle(localParentPosition as Vec2, localDestination as Vec2);

		if (angle > 0) {
			this.graphics.lineTo(Vec2.add(new Vec2(), localPosition, localDestination));
		}

		this.graphics.lineTo(Vec2.add(new Vec2(), localPosition, localParentPosition));
	}
}
