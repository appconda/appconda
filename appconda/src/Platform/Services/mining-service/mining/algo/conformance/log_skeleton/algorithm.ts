export class LogSkeletonConformanceCheckingResult {
	results: any;
	totalTraces: any;
	fitTraces: number;
	deviationsRecord: any;
	percentageFitTraces: number;
	constructor(log, results) {
		this.results = results;
		this.totalTraces = log.traces.length;
		this.fitTraces = 0;
		this.deviationsRecord = {};
		let i = 0;
		while (i < this.results.length) {
			if (this.results[i].length == 0) {
				this.fitTraces++;
			}
			else {
				for (let dev of this.results[i]) {
					if (!(dev in this.deviationsRecord)) {
						this.deviationsRecord[dev] = [];
					}
					this.deviationsRecord[dev].push(i);
				}
			}
			i++;
		}
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class LogSkeletonConformanceChecking {
	static apply(log, skeleton0, noiseThreshold=0.0, activityKey="concept:name") {
		let skeleton = skeleton0.filterOnNoiseThreshold(noiseThreshold);
		let results: any = [];
		for (let trace of log.traces) {
			results.push(LogSkeletonConformanceChecking.applyTrace(trace, skeleton, activityKey));
		}
		let ret = new LogSkeletonConformanceCheckingResult(log, results);
		
		return ret;
	}
	
	static applyTrace(trace, skeleton, activityKey) {
		let res = {};
		LogSkeletonConformanceChecking.applyEquivalence(trace, skeleton.equivalence, activityKey, res);
		LogSkeletonConformanceChecking.applyAlwaysAfter(trace, skeleton.alwaysAfter, activityKey, res);
		LogSkeletonConformanceChecking.applyAlwaysBefore(trace, skeleton.alwaysBefore, activityKey, res);
		LogSkeletonConformanceChecking.applyNeverTogether(trace, skeleton.neverTogether, activityKey, res);
		LogSkeletonConformanceChecking.applyActCounter(trace, skeleton.actCounter, activityKey, res);
		LogSkeletonConformanceChecking.applyDirectlyFollows(trace, skeleton.directlyFollows, activityKey, res);
		return Object.keys(res);
	}
	
	static applyEquivalence(trace, skeletonEquivalence, activityKey, res: any) {
		let actCounter = {};
		for (let eve of trace.events) {
			let act = eve.attributes[activityKey].value;
			if (!(act in actCounter)) {
				actCounter[act] = 1;
			}
			else {
				actCounter[act] += 1;
			}
		}
		for (let cou0 in skeletonEquivalence) {
			let cou = cou0.split(",");
			if (cou[0] in actCounter && cou[1] in actCounter && actCounter[cou[0]] != actCounter[cou[1]]) {
				res[["equivalence", cou] as any] = 0;
			}
		}
	}
	
	static applyAlwaysAfter(trace, skeletonAlwaysAfter, activityKey, res) {
		let i = 0;
		while (i < trace.events.length - 1) {
			let acti = trace.events[i].attributes[activityKey].value;
			let afterActivities: any = [];
			for (let cou0 in skeletonAlwaysAfter) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					afterActivities.push(cou[1]);
				}
			}
			let followingActivities = {};
			let j = i + 1;
			while (j < trace.events.length) {
				let actj = trace.events[j].attributes[activityKey].value;
				followingActivities[actj] = 0;
				j++;
			}
			for (let act of afterActivities) {
				if (!(act in followingActivities)) {
					res[["alwaysAfter", acti, act] as any] = 0;
				}
			}
			i++;
		}
	}
	
	static applyDirectlyFollows(trace, skeletonDirectlyFollows, activityKey, res) {
		let i = 0;
		while (i < trace.events.length - 1) {
			let acti = trace.events[i].attributes[activityKey].value;
			let afterActivities: any = [];
			for (let cou0 in skeletonDirectlyFollows) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					afterActivities.push(cou[1]);
				}
			}
			let actj = trace.events[i+1].attributes[activityKey].value;
			let followingActivities = [actj];
			let isOk = afterActivities.length == 0;
			for (let act of afterActivities) {
				if (followingActivities.includes(act)) {
					isOk = true;
				}
			}
			if (!(isOk)) {
				res[["directlyFollows", acti] as any] = 0;
			}
			i++;
		}
	}
	
	static applyAlwaysBefore(trace, skeletonAlwaysBefore, activityKey, res) {
		let i = 1;
		while (i < trace.events.length) {
			let acti = trace.events[i].attributes[activityKey].value;
			let beforeActivities: any = [];
			for (let cou0 in skeletonAlwaysBefore) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					beforeActivities.push(cou[1]);
				}
			}
			let precedingActivities = {};
			let j = i - 1;
			while (j >= 0) {
				let actj = trace.events[j].attributes[activityKey].value;
				precedingActivities[actj] = 0;
				j--;
			}
			for (let act of beforeActivities) {
				if (!(act in precedingActivities)) {
					res[["alwaysBefore", acti, act] as any] = 0;
				}
			}
			i++;
		}
	}
	
	static applyNeverTogether(trace, skeletonNeverTogether, activityKey, res) {
		let traceActivities: any = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			traceActivities[acti] = 0;
		}
		traceActivities = Object.keys(traceActivities);
		let i = 0;
		while (i < traceActivities.length-1) {
			let j = i + 1;
			while (j < traceActivities.length) {
				let cou: any = [traceActivities[i], traceActivities[j]].sort();
				if (cou in skeletonNeverTogether) {
					res[["neverTogether", cou] as any] = 0;
				}
				j++;
			}
			i = i + 1;
		}
	}
	
	static applyActCounter(trace, skeletonActCounter, activityKey, res) {
		let traceActivities = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			if (!(acti in traceActivities)) {
				traceActivities[acti] = 1;
			}
			else {
				traceActivities[acti] += 1;
			}
		}
		for (let act in traceActivities) {
			if (act in skeletonActCounter) {
				if (!(traceActivities[act] in skeletonActCounter[act])) {
					res[["actCounter", act, traceActivities[act]] as any] = 0;
				}
			}
		}
	}
}