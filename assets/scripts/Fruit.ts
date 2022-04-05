import { _decorator, Component, Node, BoxCollider2D, CCInteger } from 'cc';
const { ccclass, property, requireComponent, executeInEditMode, type } = _decorator;
import { ObjectType, Type } from './Type';

@ccclass('Fruit')
@requireComponent(Type)
@requireComponent(BoxCollider2D)
@executeInEditMode
export class Fruit extends Component {
	@type(CCInteger)
	points: CCInteger = 1;

	// in percents (1 = 0.01, means current <speed> will be increased by <speed> * 0.01)
	@type(CCInteger)
	speedUp: CCInteger = 10;

	start() {
		this.node.getComponent(Type).type = ObjectType.FRUIT;
	}
}
