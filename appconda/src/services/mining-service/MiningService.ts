import e from "express";
import { BaseService } from "../../BaseService";
import { CsvImporter } from "./mining/objects/log/importer/csv/importer";
import { XesImporter } from "./mining/objects/log/importer/xes/importer";
import { EventLog, Trace } from "./mining/objects/log/log";
import { GeneralLogStatistics } from "./mining/statistics/log/general";
import { nanoid } from "../../modules/nanoid/nanoid";

const { MongoClient, ServerApiVersion } = require("mongodb");


const multer = require("multer");


var moment = require('moment'); // require
const humanizeDuration = require("humanize-duration");

const DEFAULT_ACTIVITY = 'Activity';
const DEFAULT_COST = 'Cost';

const DateDiff = {

  inMiliseconds: function (d1, d2) {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return t2 - t1;
  },

  inDays: function (d1, d2) {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt((t2 - t1) / (24 * 3600 * 1000) as any);
  },

  inWeeks: function (d1, d2) {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7) as any);
  },

  inMonths: function (d1, d2) {
    var d1Y = d1.getFullYear();
    var d2Y = d2.getFullYear();
    var d1M = d1.getMonth();
    var d2M = d2.getMonth();

    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
  },

  inYears: function (d1, d2) {
    return d2.getFullYear() - d1.getFullYear();
  }
}

const separators = [",", ";", "\t"];
function detectSeparator(csv) {
  var counts = {},
    sepMax;
  separators.forEach(function (sep, i) {
    var re = new RegExp(sep, 'g');
    counts[sep] = (csv.match(re) || []).length;
    sepMax = !sepMax || counts[sep] > counts[sepMax] ? sep : sepMax;
  });
  return sepMax;
}

export default class MiningService extends BaseService {

  public get uid(): string {
    return 'com.realmocean.service.mining';
  }

  get displayName(): string {
    return 'Mining Service'
  }

  get theme(): string {
    return "#7B68EE";
  }

  get icon(): string {
    return "/images/services/mining.png";
  }

  async init() {


    /* const client = new MongoClient('mongodb://mongodb:27017/node-boilerplate', {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");

      const myDB = client.db("(celmino)(realmx)(appletx)(taskApprove)");
      const myColl = myDB.collection("ProcessName");
      const doc = { name: "Neapolitan pizza", shape: "round" };
      const result = await myColl.insertOne(doc);
      console.log(
        `A document was inserted with the _id: ${result.insertedId}`,
      );

    } finally {
      await client.close();
    }
 */

    const router = this.webServer.getRouter();

    const upload = multer();
    router.post('/mining/load/csv', upload.array("files"), async (req: e.Request, res: e.Response) => {
      const files = (req as any).files;

      const content = files[0].buffer.toString('utf8');
      const logId = await this.loadCsv(content);
      /* 
            console.log(req.body);
            console.log(files[0].buffer.toString('utf8')); */

      res.json({
        logId
      });
    })

    router.get('/mining/:logId/variantInfo/', async (req: e.Request, res: e.Response) => {
      const logId = req.params.logId;
      const variantInfo = await this.getVariantsInfo(logId);

      res.json(variantInfo);
    })

  }

  private getTraceEventsCount(trace: Trace): number {
    if (trace) {
      return trace.events.length;
    }
    return 0;
  }

  private getEventsCount(eventLog: EventLog): number {
    let eventsCount = 0;
    if (eventLog) {
      for (let i = 0; i < eventLog.traces.length; i++) {
        eventsCount += this.getTraceEventsCount(eventLog.traces[i]);
      }
      return eventsCount;
    }
    return 0;
  }

  public async loadCsv(csv: string, sep?: string, caseId?: string, activity?: string,
    timestamp?: string): Promise<string> {


    const eventLogs = CsvImporter.apply(csv, sep == null ? detectSeparator(csv) : sep, "'", caseId, activity, timestamp);
    const logId =  this.idService.generateID();
   

    await this.kvService.set(logId, eventLogs);
    return logId;
  }

  public async getEventLogFromCsv(csv: string, sep?: string, caseId?: string, activity?: string,
    timestamp?: string): Promise<EventLog> {
    const eventLogs = CsvImporter.apply(csv, sep == null ? detectSeparator(csv) : sep, "'", caseId, activity, timestamp);
    return eventLogs;
  }

  public async getEventLogFromXes(xes: string): Promise<EventLog> {
    const eventLogs = XesImporter.apply(xes);
    return eventLogs;
  }

  public async getEventCount(logId: string): Promise<number> {
    const eventLog: EventLog = await this.kvService.get(logId);
    return eventLog.traces.length;
  }

  public async getCasesStartedPerDay(logId: string): Promise<any> {

    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const startDate = eventLog.traces[0].events[0].attributes[timestamp].value;
    const endDate = eventLog.traces[eventLog.traces.length - 1].events[eventLog.traces[eventLog.traces.length - 1].events.length - 1].attributes[timestamp].value;
    var date1 = moment(startDate);
    var date2 = moment(endDate);
    const days = date2.diff(date1, 'days');
    return (Math.round(eventLog.traces.length / days) * 100) / 100;

  }

  public async getActivitiesStartedPerDay(logId: string): Promise<number> {

    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const startDate = eventLog.traces[0].events[0].attributes[timestamp].value;
    const endDate = eventLog.traces[eventLog.traces.length - 1].events[eventLog.traces[eventLog.traces.length - 1].events.length - 1].attributes[timestamp].value;
    var date1 = moment(startDate);
    var date2 = moment(endDate);
    const days = date2.diff(date1, 'days');
    const eventsCount = this.getEventsCount(eventLog);
    if (eventsCount > 0) {
      return (Math.round(eventsCount / days) * 100) / 100;
    }
    return 0;


  }

  public async getActivitiesPerCase(logId: string): Promise<number> {
    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);
    const eventsCount = this.getEventsCount(eventLog);
    if (eventsCount > 0) {
      return (Math.round(eventsCount / eventLog.traces.length) * 100) / 100;
    }
    return 0;
  }

  public async getVariantsInfo(logId: string): Promise<any> {

    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const getVariantEventCount = (variant: any) => {
      if (variant.count > 0 && variant.traces.length > 0 && variant.traces[0].events.length > 0) {
        return variant.traces[0].events.length;
      }
    }

    const getVariantTotalEventCount = (variant: any) => {
      if (variant.count > 0 && variant.traces.length > 0 && variant.traces[0].events.length > 0) {
        return variant.count * variant.traces.length * variant.traces[0].events.length;
      }
    }


    const getVariantAvgTime = (variant: any) => {
      let sum = 0;
      for (let i = 0; i < variant.traces.length; i++) {
        sum += getTraceTotalTime(variant.traces[i]);
      }
      return sum / variant.count;
    }

    const getVariantTotalTime = (variant: any) => {
      let sum = 0;
      for (let i = 0; i < variant.traces.length; i++) {
        sum += getTraceTotalTime(variant.traces[i]);
      }
      return sum;
    }

    const getTraceTotalTime = (trace: Trace) => {
      let startTime = trace.events[0].attributes[timestamp].value;
      let endTime = trace.events[trace.events.length - 1].attributes[timestamp].value;
      for (let i = 0; i < trace.events.length; i++) {
        if (trace.events[i].attributes[timestamp].value < startTime) {
          startTime = trace.events[i].attributes[timestamp].value;
        }
        if (trace.events[i].attributes[timestamp].value > startTime) {
          endTime = trace.events[i].attributes[timestamp].value;
        }
      }
      return DateDiff.inMiliseconds(startTime, endTime);
    }

    const variantsArray: any = [];
    const variants = GeneralLogStatistics.getVariants(eventLog, DEFAULT_ACTIVITY);
    console.log(variants)
    for (let key in variants) {

      const variantInfo = {
        activities: key.split(','),
        traces: variants[key].traces,
        traceCount: variants[key].traces.length,
        eventCountPerTrace: getVariantEventCount(variants[key]),
        totalEventCount: getVariantTotalEventCount(variants[key]),
        totalTime: getVariantTotalTime(variants[key]),
        avgTime: getVariantAvgTime(variants[key])
      };

      variantsArray.push(variantInfo);
    }

    variantsArray.sort((a, b) => {
      return b.traceCount - a.traceCount;
    });

    return {
      variants: variantsArray,
      datasetEventCount: variantsArray.reduce((partial_sum, a) => partial_sum + a.totalEventCount, 0),
      totalTime: variantsArray.reduce((partial_sum, a) => partial_sum + a.totalTime, 0)
    }
  }

  public async getEventsOverTime(logId: string): Promise<any> {

    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const datearray: any = [];
    const startDate = eventLog.traces[0].events[0].attributes[timestamp].value;
    const endDate = eventLog.traces[eventLog.traces.length - 1].events[eventLog.traces[eventLog.traces.length - 1].events.length - 1].attributes[timestamp].value;
    const diff = endDate - startDate;
    const step = Convert.ToInt32(diff / (24 * 60 * 60 * 1000));
    for (let i = 1; i < step + 1; i++) {
      datearray.push({
        start: moment(startDate).add(((24 * 60 * 60 * 1000)) * (i - 1)).toDate(),
        end: moment(startDate).add(((24 * 60 * 60 * 1000)) * i).toDate(),
        count: 0
      });
    }
    for (let i = 0; i < eventLog.traces.length; i++) {
      for (let j = 0; j < eventLog.traces[i].events.length; j++) {
        for (let k = 0; k < datearray.length; k++) {
          const eventStartDate = eventLog.traces[i].events[j].attributes[timestamp].value;
          if (eventStartDate >= datearray[k].start && eventStartDate <= datearray[k].end) {
            datearray[k].count++;
          }
        }
      }
    }
    return datearray;
  }

  public async getStartEvents(logId: string): Promise<any> {

    const eventLog: EventLog = await this.kvService.get(logId);
    const result = GeneralLogStatistics.getStartActivities(eventLog, DEFAULT_ACTIVITY);
    return result;
  }

  public async getEndEvents(logId: string): Promise<any> {
    const eventLog: EventLog = await this.kvService.get(logId);
    const result = GeneralLogStatistics.getEndActivities(eventLog, DEFAULT_ACTIVITY);
    return result;
  }

  public async getTraceCount(logId: string): Promise<any> {
    const eventLog: EventLog = await this.kvService.get(logId);
    return eventLog.traces.length;
  }

  public async getMeanCaseDuration(logId: string): Promise<any> {
    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const array: any = [];
    for (let i = 0; i < eventLog.traces.length; i++) {
      const caseStartDate = eventLog.traces[i].events[0].attributes[timestamp].value;
      const caseEndDate = eventLog.traces[i].events[eventLog.traces[i].events.length - 1].attributes[timestamp].value;
      array.push(caseEndDate - caseStartDate);
    }
    const median = GeneralLogStatistics.calculateMean(array);
    const hum = humanizeDuration(median, { units: ["d", "h", "m"], round: true });

    return hum;
  }

  public async getMedianCaseDuration(logId: string): Promise<any> {
    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);

    const array: any = [];
    for (let i = 0; i < eventLog.traces.length; i++) {
      const caseStartDate = eventLog.traces[i].events[0].attributes[timestamp].value;
      const caseEndDate = eventLog.traces[i].events[eventLog.traces[i].events.length - 1].attributes[timestamp].value;
      array.push(caseEndDate - caseStartDate);
    }
    const median = GeneralLogStatistics.calculateMedian(array);
    const hum = humanizeDuration(median, { units: ["d", "h", "m"], round: true });
    return hum;
  }

  public async getAverageCostOfDataset(logId: string): Promise<any> {
    const timestamp = 'time:timestamp';
    const eventLog: EventLog = await this.kvService.get(logId);
    let sum: int = 0;

    for (let i = 0; i < eventLog.traces.length; i++) {
      const events = eventLog.traces[i].events;
      for (let j = 0; j < events.length; j++) {
        const event = events[j];
        if (event.attributes[DEFAULT_COST] != null && is.int(event.attributes[DEFAULT_COST].value)) {
          sum += Convert.ToInt32(event.attributes[DEFAULT_COST].value);
        }
      }

    }
    return Convert.ToInt32(sum / eventLog.traces.length);

  }

  public async getTotalCostOfDataset(logId: string): Promise<any> {
    const eventLog: EventLog = await this.kvService.get(logId);
    let sum: int = 0;

    for (let i = 0; i < eventLog.traces.length; i++) {
      const events = eventLog.traces[i].events;
      for (let j = 0; j < events.length; j++) {
        const event = events[j];
        if (event.attributes[DEFAULT_COST] != null && is.int(event.attributes[DEFAULT_COST].value)) {
          sum += Convert.ToInt32(event.attributes[DEFAULT_COST].value);
        }
      }

    }
    return Convert.ToInt32(sum);
  }

  public async getActivities(logId: string): Promise<any> {
    const eventLog: EventLog = await this.kvService.get(logId);
    const activitySet = new Set();
    const activities: any = [];

    for (let i = 0; i < eventLog.traces.length; i++) {
      for (let j = 0; j < eventLog.traces[i].events.length; j++) {
        const value = eventLog.traces[i].events[j].attributes[DEFAULT_ACTIVITY].value;
        if (activities.indexOf(value) === -1) {
          activities.push(value);
        }
      }
    }
    return activities;
  }
}



