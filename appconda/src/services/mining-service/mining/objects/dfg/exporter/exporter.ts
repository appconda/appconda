export class FrequencyDfgExporter {
	static apply(frequencyDfg) {
		let ret: any = [];
		let activities: any = Object.keys(frequencyDfg.activities);
		ret.push(activities.length);
		for (let act in frequencyDfg.activities) {
			ret.push(act);
		}
		ret.push(Object.keys(frequencyDfg.startActivities).length);
		for (let act in frequencyDfg.startActivities) {
			ret.push(activities.indexOf(act)+"x"+frequencyDfg.startActivities[act]);
		}
		ret.push(Object.keys(frequencyDfg.endActivities).length);
		for (let act in frequencyDfg.endActivities) {
			ret.push(activities.indexOf(act)+"x"+frequencyDfg.endActivities[act]);
		}
		for (let path0 in frequencyDfg.pathsFrequency) {
			let path = path0.split(",");
			ret.push(activities.indexOf(path[0])+">"+activities.indexOf(path[1])+"x"+frequencyDfg.pathsFrequency[path0]);
		}
		return ret.join("\n");
	}
}
