import { Vec2, CCFloat, Node, Rect, BoxCollider2D, Vec3 } from 'cc';

import { Controller } from './Controller';
import { Tail } from './Tail';

export const UP: Vec2 = new Vec2(0, 1);
export const RIGHT: Vec2 = new Vec2(1, 0);
export const DOWN: Vec2 = new Vec2(0, -1);
export const LEFT: Vec2 = new Vec2(-1, 0);
export const EPSILON: CCFloat = 0.001;
export const CELL_SIZE: CCFloat = 64;

export interface Routable {
	getStartPosition(): Vec2;
	getDestination(): Vec2;
	getCurrentDirection(): Vec2;
}

export function getNodeStartPosition(node: Node) {
	const component: Routable|null = node.getComponent(Tail) || node.getComponent(Controller);

	return component ? component.getStartPosition() : null;
}

export function getNodeDestination(node: Node) {
	const component: Routable|null = node.getComponent(Tail) || node.getComponent(Controller);

	return component ? component.getDestination() : null;
}

export function getNodeCurrentDirection(node: Node) {
	const component: Routable|null = node.getComponent(Tail) || node.getComponent(Controller);

	return component ? component.getCurrentDirection() : null;
}

export function colliderToRect(boxCollider: BoxCollider2D): Rect {
    const rect: Rect = new Rect();
	const node: Node = boxCollider.node;
	const position: Vec3 = node.getWorldPosition(new Vec3());
    const x = position.x;
    const y = position.y;
    rect.x = (x + boxCollider.offset.x) - boxCollider.size.width * 0.5;
    rect.y = (y + boxCollider.offset.y) - boxCollider.size.height * 0.5;
    rect.width = boxCollider.size.width;
    rect.height = boxCollider.size.height;

    return rect;
}
