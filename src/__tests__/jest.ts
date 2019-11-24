/* eslint-disable prefer-destructuring */
// Allows us to "import" jest functions as if they were a module
// this is needed because we use both jest and jasmine (with karma) which have clashing APIs
// by removing the declared globals in typings in type-overrides/jest/index.d.ts, we will now need to import
// these in each jest test file
const g = global as any

export const beforeAll: jest.Lifecycle = g.beforeAll
export const beforeEach: jest.Lifecycle = g.beforeEach
export const afterAll: jest.Lifecycle = g.afterAll
export const afterEach: jest.Lifecycle = g.afterEach
export const describe: jest.Describe = g.describe
export const fdescribe: jest.Describe = g.fdescribe
export const xdescribe: jest.Describe = g.xdescribe
export const it: jest.It = g.it
export const fit: jest.It = g.fit
export const xit: jest.It = g.xit
export const test: jest.It = g.test
export const xtest: jest.It = g.xtest

export const expect: jest.Expect = g.expect
