import logger from '@wdio/logger';
import WDIOReporter, { TestStats } from '@wdio/reporter';
import { TestRail } from './testrail';
import { Status } from './testrail.interface';
import { titleToCaseIds } from './shared';
import { events } from './event.type';

export default class TestRailReporter extends WDIOReporter {
  public options;
  private log;
  private results;
  private runId;
  private comments;

  public client = new TestRail(this.options);
  constructor(options) {
    super(options);
    options = Object.assign(options, { stdout: false });
    this.log = logger('wdio-v7-testrail-reporter');
    this.validate(options, 'testRailUrl');
    this.validate(options, 'username');
    this.validate(options, 'password');
    this.validate(options, 'projectId');
    this.validate(options, 'suiteId');

    // compute base url
    this.options = options;
    this.results = [];
    this.comments = '';
    this.registerListeners();
  }

  registerListeners() {
    process.on(events.addComment, this.addComments.bind(this));
  }

  async onSuiteStart() {
    const lastRun = await this.client.getLastTestRun(this.options.projectId, this.options.suiteId);
    this.runId = lastRun.runs[0].id;
  }

  onTestStart(test) {
    this.results = [];
    this.comments = '';
  }

  onTestPass(test) {
    let caseIds = titleToCaseIds(test.title);
    if (caseIds.length > 0) {
      let results = caseIds.map((caseId) => {
        return {
          case_id: caseId,
          status_id: Status.Passed,
          comment: this.comments,
          elapsed: test.duration,
        };
      });
      this.results.push(...results);
    }
    this.client.addResultsForCases(this.runId, this.results);
  }

  async onTestFail(test) {
    let caseIds = titleToCaseIds(test.title);

    if (this.comments != '') {
      this.comments += '\n';
    }

    if (caseIds.length > 0) {
      let results = caseIds.map((caseId) => {
        return {
          case_id: caseId,
          status_id: Status.Failed,
          comment: `${this.comments}${test.error.message}`,
          elapsed: test.duration,
        };
      });
      this.results.push(...results);
    }
    await this.client.addResultsForCases(this.runId, this.results);
  }

  async onSuiteEnd() {
    if (this.results.length == 0) {
      this.log.error(
        'No testcases were matched. Ensure that your tests are declared correctly and matches format Cxxx. For example C420',
      );
    }
  }

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing options. Please look into documentation');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} option value. Please look into documentation`);
    }
  }

  addComments(args) {
    this.comments += args + '\n';
  }

  static addComment = (value) => {
    process.emit(events.addComment, value);
  };
}
