# WebdriverIO v7 Mocha Testrail Reporter

====================
> A WebdriverIO v7 reporter for Testrail. It will update last test run you have on testrail.
> Clone from [original reporter](https://github.com/Virtim/wdio-v6-testrail-reporter)

## Configuration

Npm Install:

`
npm i wdio-v7-testrail-reporter --save-dev
`

Yarn Install:

`
yarn add -D wdio-v7-testrail-reporter
`

Import this library in you wdio.conf.js

```js
const TestRailReporter = require('wdio-v7-testrail-reporter')
```

Your reporters should look like this:

```js
    reporters: ['spec', [TestRailReporter, {
      testRailUrl: 'YourCompanyName.testrail.io',
      username: 'email@companyname.com',
      password: 'testrail api key',
      projectId: 1,
      suiteId: 1,
    }]],
```

Since it's only updating last test run you will either need to create test run manually or make an api call to create one in onPrepare hook in your wdio.conf.js.

Creating test run function(we do it with axios, but you can use testrail api packages of your choice, doesn't really matter)

```js
async function createTestRun() {
  const response = await axios.post(
    `https://YourCompanyName.testrail.io/index.php?/api/v2/add_run/${projectId}`,
    {
      suite_id: 1,
      name: 'Test Run name',
      include_all: true,
    },
    {
      auth: {
        username: 'email@companyname.com',
        password: 'testrail api key',
      },
    },
  );
}
```

```js
    async onPrepare () {
      createTestRun()
    }
```

## FAQ

_Why is it only updating last test run and not creating test run inside reporter itself?_

I wasn't able to figure out how to create test run and reuse this testrun id with a new webdriverio reporter. `onSuiteStart` hook is called every time spec file is ran, not whole suite as a collection of files. Same with `onRunnerStart`. If you have 10 tests all runing in parallel it would create 10 test runs. If you know how to solve this problem please create a pull request or tell me how and i will be happy to fix this part.

## References

- <https://www.npmjs.com/package/mocha-testrail-reporter>
- <https://www.npmjs.com/package/wdio-v5-testrail-reporter>
- <https://www.npmjs.com/package/wdio-testrail-reporter>
- <https://www.npmjs.com/package/wdio-reportportal-reporter>
- <http://webdriver.io/guide/reporters/customreporter.html>
- <http://docs.gurock.com/testrail-api2/start>
