import { _decorator, Component, Node, Vec3, Rect, clamp, view, Size, game, Camera, screen } from 'cc';
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

		// Copypaste from Canvas::_onResizeCamer
		if (cameraComponent.targetTexture) {
			const win = cameraComponent.targetTexture.window;
			if (cameraComponent.camera) {
				cameraComponent.camera.setFixedSize(win!.width, win!.height);
			}
			cameraComponent.orthoHeight = visibleRect.height / 2;
		} else if (game.canvas) {
			if (cameraComponent.camera) {
				cameraComponent.camera.resize(size.width, size.height);
			}
			cameraComponent.orthoHeight = game.canvas.height / view.getScaleY() / 2;
		}
	}

	start() {
		this.halfScreenSize = screen.windowSize;
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
