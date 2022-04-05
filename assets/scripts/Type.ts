import { _decorator, Component, Node, Enum } from 'cc';
const { ccclass, property, type } = _decorator;

export enum ObjectType {
	NONE,
	OBSTACLE,
	FRUIT
}
Enum(ObjectType);

@ccclass('Type')
export class Type extends Component {
	@type(ObjectType)
	type: ObjectType = ObjectType.NONE;
}
