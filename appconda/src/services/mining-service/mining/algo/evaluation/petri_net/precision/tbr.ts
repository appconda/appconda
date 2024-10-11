import { EventLogPrefixes } from "../../../../objects/log/util/prefixes";
import { PetriNetReachableVisibleTransitions } from "../../../../objects/petri_net/util/reachable_visible_transitions";
import { GeneralLogStatistics } from "../../../../statistics/log/general";
import { TokenBasedReplay } from "../../../conformance/tokenreplay/algorithm";

export class ETConformanceResult {
	activatedTransitions: any;
	escapingEdges: any;
	precision: any;
	constructor(activatedTransitions, escapingEdges, precision) {
		this.activatedTransitions = activatedTransitions;
		this.escapingEdges = escapingEdges;
		this.precision = precision;
	}
}

export class ETConformance {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		let prefixes = EventLogPrefixes.apply(eventLog, activityKey);
		let prefixesKeys = Object.keys(prefixes);
		let ret = TokenBasedReplay.applyListListAct(prefixesKeys, acceptingPetriNet, false, true);
		let i = 0;
		let sum_at = 0;
		let sum_ee = 0;
		let logTransitions = Object.keys(GeneralLogStatistics.getStartActivities(eventLog, activityKey));
		let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, acceptingPetriNet.im);
		let escapingEdges: any = [];
		for (let at of activatedTransitions) {
			if (!(logTransitions.includes(at))) {
				escapingEdges.push(at);
			}
		}
		sum_at += activatedTransitions.length * eventLog.traces.length;
		sum_ee += escapingEdges.length * eventLog.traces.length;
		i = 0;
		while (i < prefixesKeys.length) {
			if (ret[i].isFit) {
				let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, ret[i]);
				let prefix = prefixesKeys[i];
				let logTransitions = Object.keys(prefixes[prefix]);
				let sumPrefix = 0;
				for (let transition of logTransitions) {
					sumPrefix += prefixes[prefix][transition];
				}
				let escapingEdges: any = [];
				for (let at of activatedTransitions) {
					if (!(logTransitions.includes(at))) {
						escapingEdges.push(at);
					}
				}
				sum_at += activatedTransitions.length * sumPrefix;
				sum_ee += escapingEdges.length * sumPrefix;
			}
			i++;
		}
		let precision = 1.0;
		if (sum_at > 0) {
			precision = 1.0 - (sum_ee / (0.0 + sum_at));
		}
		let finalResult = new ETConformanceResult(sum_at, sum_ee, precision);
		return finalResult;
	}
}
