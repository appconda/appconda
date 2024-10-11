import { StreamAttrWrapper } from "../../../utils/stream/stream_attr_wrapper";

export class NetworkAnalysisResult {
	nodes: any;
	multiEdges: any;
	constructor(nodes, multiEdges) {
		this.nodes = nodes;
		this.multiEdges = multiEdges;
	}
}

export class NetworkAnalysis {
	static apply(links, sourceNodeAgg, targetNodeAgg, edgeAgg, source=true) {
		let nodes = {};
		let multiEdges = {};
		for (let el of links) {
			let se: any = el[0];
			let te: any = el[1];
			let sn: any = StreamAttrWrapper.accessAttribute(se, sourceNodeAgg);
			let tn: any = StreamAttrWrapper.accessAttribute(te, targetNodeAgg);
			let eg: any = null;
			if (source) {
				eg = StreamAttrWrapper.accessAttribute(se, edgeAgg);
			}
			else {
				eg = StreamAttrWrapper.accessAttribute(te, edgeAgg);
			}
			
			if (sn != null && tn != null && eg != null) {
				eg = [sn, tn, eg];
				
				let st = StreamAttrWrapper.defaultTimestamp(se).getTime();
				let tt = StreamAttrWrapper.defaultTimestamp(te).getTime();
				let diff = (tt - st) / 1000.0;
				
				if (!(sn in nodes)) {
					nodes[sn] = {"IN": 0, "OUT": 0};
				}
				if (!(tn in nodes)) {
					nodes[tn] = {"IN": 0, "OUT": 0};
				}
				if (!(eg in multiEdges)) {
					multiEdges[eg] = {"count": 0, "timeDiff": []};
				}
				nodes[sn]["OUT"] += 1;
				nodes[tn]["IN"] += 1;
				multiEdges[eg]["count"] += 1;
				multiEdges[eg]["timeDiff"].push(diff);
			}
		}
		return new NetworkAnalysisResult(nodes, multiEdges);
	}
}

