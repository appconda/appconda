export class ProcessTreeOperator {
	static SEQUENCE: string;
	static PARALLEL: string;
	static INCLUSIVE: string;
	static EXCLUSIVE: string;
	static LOOP: string;
}

ProcessTreeOperator.SEQUENCE = "sequence";
ProcessTreeOperator.PARALLEL = "and";
ProcessTreeOperator.INCLUSIVE = "or";
ProcessTreeOperator.EXCLUSIVE = "xor";
ProcessTreeOperator.LOOP = "xorLoop";

export class ProcessTree {
	parentNode: any;
	operator: any;
	label: any;
	id: string;
	children: any[];
	properties: any;
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	constructor(parentNode?, operator?, label?) {
		this.parentNode = parentNode;
		this.operator = operator;
		this.label = label;
		this.id = ProcessTree.uuidv4();
		this.children = [];
		this.properties = {};
	}
	
	toString() {
		if (this.operator == null) {
			if (this.label == null) {
				return "tau";
			}
			else {
				return "'"+this.label+"'";
			}
		}
		else {
			let opMapping = {};
			opMapping[ProcessTreeOperator.SEQUENCE] = "->";
			opMapping[ProcessTreeOperator.PARALLEL] = "+";
			opMapping[ProcessTreeOperator.INCLUSIVE] = "O";
			opMapping[ProcessTreeOperator.EXCLUSIVE] = "X";
			opMapping[ProcessTreeOperator.LOOP] = "*";
			let childRepr:any = [];
			for (let n of this.children) {
				childRepr.push(n.toString());
			}
			return opMapping[this.operator] + " ( " + childRepr.join(', ') + " ) ";
		}
	}
}

