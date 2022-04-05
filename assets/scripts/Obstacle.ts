import { _decorator, Component, Node, BoxCollider2D } from 'cc';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;
import { ObjectType, Type } from './Type';

@ccclass('Obstacle')
@requireComponent(Type)
@requireComponent(BoxCollider2D)
@executeInEditMode
export class Obstacle extends Component {
	start() {
		this.node.getComponent(Type).type = ObjectType.OBSTACLE;
	}
}
