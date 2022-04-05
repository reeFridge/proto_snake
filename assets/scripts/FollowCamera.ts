import { _decorator, Component, Node, Vec3, Rect, clamp, screen } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
	@property(Node)
	target: Node;

	@property(Rect)
	worldRect: Rect = new Rect(0, 0, 100, 100);

	update(deltaTime: number) {
		const targetPosition: Vec3 = this.target.getWorldPosition();
		const currentZ = this.node.getWorldPosition().z;
		// it is ok to mutate it (cloned in getter)
		const halfScreenSize = screen.windowSize;
		halfScreenSize.width /= 2;
		halfScreenSize.height /= 2;
		const safeRect = new Rect(
			this.worldRect.x + halfScreenSize.width,
			this.worldRect.y + halfScreenSize.height,
			this.worldRect.x + this.worldRect.width - halfScreenSize.width,
			this.worldRect.y + this.worldRect.height - halfScreenSize.height
		);
		this.node.setWorldPosition(new Vec3(
			clamp(targetPosition.x, safeRect.x, safeRect.width),
			clamp(targetPosition.y, safeRect.y, safeRect.height),
			currentZ
		));
	}

	setWorldRect(rect: Rect) {
		this.worldRect = rect;
	}
}
