import { _decorator, Component, Node, Vec3, Rect, clamp, view, Size } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
	@property(Node)
	target: Node;

	@property(Rect)
	worldRect: Rect = new Rect(0, 0, 100, 100);

	private halfScreenSize: Size = new Size();

	start() {
		this.halfScreenSize = view.getVisibleSize();
		this.halfScreenSize.width /= 2;
		this.halfScreenSize.height /= 2;
	}

	lateUpdate(deltaTime: number) {
		const targetPosition: Vec3 = this.target.getWorldPosition();
		const currentZ = this.node.getWorldPosition().z;
		const safeRect = new Rect(
			this.worldRect.x + this.halfScreenSize.width,
			this.worldRect.y + this.halfScreenSize.height,
			this.worldRect.x + this.worldRect.width - this.halfScreenSize.width,
			this.worldRect.y + this.worldRect.height - this.halfScreenSize.height
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
