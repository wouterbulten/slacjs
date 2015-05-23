class LinkedList {
	/**
	 * Create a new linked linst
	 * @param  {LinkedList} base The previous link
	 * @return LinkedList
	 */
	constructor(base = undefined) {
		if (base !== undefined && typeof base != 'object') {
			console.error('Base must be a LinkedList');
		}

		this.list = [base];
	}

	add(element) {
		this.list.push(element);

		return this;
	}

	/**
	 * Return a flat array of the linked list
	 * @return {Array}
	 */
	values() {
		let values = [];

		//First element of the list is another list or undefined
		if (this.list[0] !== undefined) {
			values = this.list[0].values();
		}

		values = values.concat(this.list.slice(1));

		return values;
	}

	/**
	 * Only return the elements of this list and not of its parents
	 * @return {Array}
	 */
	currentValues() {
		return this.list.slice(1);
	}

	/**
	 * Return true when this parent has a parent list
	 * @return {Boolean}
	 */
	hasParent() {
		return this.list[0] !== undefined;
	}

	/**
	 * Return the last object in the list
	 * @return {mixed}
	 */
	last() {
		return this.list[this.list.length - 1];
	}

	/**
	 * Return the base of this linked list
	 * @return {undefined|LinkedList}
	 */
	getBase() {
		return this.list[0];
	}
}

export default LinkedList;