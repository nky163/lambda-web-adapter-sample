import {handler}  from '../../lambda/cognito-userpool-triggers/customMessage'
import { hello } from '../../lib/util/hello';
test('test', async () => {
  const res = await handler({triggerSource : 'CustomMessage', request: {codeParameter: 'aaaa'}, response: {}});
  // const res = hello();
  expect(res).toBe({});
})