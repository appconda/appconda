import { FrequencyDfg } from "../frequency/obj";

export class FrequencyDfgImporter {
	static apply(txtStri) {
		let stri = txtStri.split("\n");
		let i = 0;
		let numActivities = i + 1 + parseInt(stri[i]);
		i++;
		let activities: any = [];
		let activitiesIngoing = {};
		let startActivities = {};
		let endActivities = {};
		let pathsFrequency = {};
		while (i < numActivities) {
			activities.push(stri[i].trim());
			i++;
		}
		let numStartActivities = i + 1 + parseInt(stri[i]);
		i++;
		while (i < numStartActivities) {
			let stru = stri[i].trim().split("x");
			let act = activities[parseInt(stru[0])]
			startActivities[act] = parseInt(stru[1]);
			if (!(act in activitiesIngoing)) {
				activitiesIngoing[act] = 0;
			}
			activitiesIngoing[act] += parseInt(stru[1]);
			i++;
		}
		let numEndActivities = i + 1 + parseInt(stri[i]);
		i++;
		while (i < numEndActivities) {
			let stru = stri[i].trim().split("x");
			let act = activities[parseInt(stru[0])];
			endActivities[act] = parseInt(stru[1]);
			i++;
		}
		while (i < stri.length) {
			let stru = stri[i].trim();
			if (stru.length > 0) {
				let act1 = activities[parseInt(stru.split(">")[0])];
				let act2 = activities[parseInt(stru.split("x")[0].split(">")[1])];
				let count = parseInt(stru.split("x")[1]);
				if (!(act2 in activitiesIngoing)) {
					activitiesIngoing[act2] = 0;
				}
				activitiesIngoing[act2] += count;
				pathsFrequency[[act1, act2] as any] = count;
			}
			i++;
		}
		let ret = new FrequencyDfg(activitiesIngoing, startActivities, endActivities, pathsFrequency);
		return ret;
	}
}

