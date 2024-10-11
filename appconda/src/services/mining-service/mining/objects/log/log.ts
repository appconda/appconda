export class EventLog {
	attributes: any;
	traces: any[];
	extensions: any;
	globals: any;
	classifiers: any;
	constructor() {
		this.attributes = {};
		this.traces = [];
		this.extensions = {};
		this.globals = {};
		this.classifiers = {};
	}
}

export class Trace {
	attributes: any;
	events: any[];
	constructor() {
		this.attributes = {};
		this.events = [];
	}
}

export class Event {
	attributes: any;
	constructor() {
		this.attributes = {};
	}
}

export class LogGlobal {
	attributes: any;
	constructor() {
		this.attributes = {};
	}
}

export class Attribute {
	value: any;
	attributes: any[];
	constructor(value) {
		this.value = value;
		this.attributes = [];
	}
}


