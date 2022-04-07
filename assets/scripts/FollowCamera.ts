import { _decorator, Component, Node, Vec3, Rect, clamp, view, Size, game, Camera, screen, visibleRect } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
	@property(Node)
	target: Node;

	@property(Rect)
	worldRect: Rect = new Rect(0, 0, 100, 100);

	private halfScreenSize: Size = new Size();
	
	onLoad() {
		const size = game.canvas;
		const cameraComponent: Camera = this.node.getComponent(Camera);
		const dpr = screen.devicePixelRatio;

		// Copypaste from Canvas::_onResizeCamera (for web build only)
		if (game.canvas) {
			cameraComponent.orthoHeight = (game.canvas.height / dpr) / 2;
		}
	}

	start() {
		// for retina = 2
		// in general = 1
		const dpr = screen.devicePixelRatio;
		this.halfScreenSize = screen.windowSize;
		this.halfScreenSize.width = (this.halfScreenSize.width / dpr) / 2;
		this.halfScreenSize.height = (this.halfScreenSize.height / dpr) / 2;
		const cameraComponent: Camera = this.node.getComponent(Camera);
		cameraComponent.orthoHeight = this.halfScreenSize.height;
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
