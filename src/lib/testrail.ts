const axios = require('axios');
import logger from '@wdio/logger';
import { TestRailOptions, TestRailResult } from './testrail.interface';

/**
 * TestRail basic API wrapper
 */
export class TestRail {
  private log;

  constructor(private options: TestRailOptions) {
    // compute base url
    axios.defaults.baseURL = `https://${options.testRailUrl}/index.php?/api/v2/`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    this.log = logger('wdio-v7-testrail-reporter');
  }

  async _get(endpoint: string) {
    try {
      const response = await axios.get(endpoint, {
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Error: %s', JSON.stringify(error.body));
    }
  }

  async _post(endpoint: string, body: object) {
    try {
      const response = await axios.post(endpoint, body, {
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
      });
      return response.data;
    } catch (error) {
      this.log.error('Error: %s', JSON.stringify(error.body));
    }
  }

  public async addResultsForCases(runID, results: TestRailResult[]) {
    await this._post(`add_results_for_cases/${runID}`, {
      results: results,
    });
  }

  public getLastTestRun(projectId, suiteId) {
    return this._get(`get_runs/${projectId}&suite_id=${suiteId}&limit=1`);
  }
}
