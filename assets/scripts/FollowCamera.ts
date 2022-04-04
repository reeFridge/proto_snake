import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
	@property(Node)
	target: Node;

	update(deltaTime: number) {
		const targetPosition: Vec3 = this.target.getWorldPosition();
		const currentZ = this.node.getWorldPosition().z;
		this.node.setWorldPosition(new Vec3(targetPosition.x, targetPosition.y, currentZ));
	}
}
