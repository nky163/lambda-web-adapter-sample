import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

const resourceConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-1_oEn1lXLL0',
      userPoolClientId: '529d85i5il8roo65e5pof0b0j',
    },
  },
  API: {
    REST: {
      MyAPIGatewayAPI: {
        endpoint: 'https://d3bein1pyk4620.cloudfront.net/api',
      },
    },
  },
}

const libraryOptions = {
  API: {
    REST: {
      headers: async () => {
        return { Authorization: `Bearer ${(await fetchAuthSession()).tokens?.idToken}` }
      },
    },
  },
}

// すでに作成済みの Cognito リソースの情報を手動で入れる
const createAmplify = () => {
  Amplify.configure(resourceConfig, libraryOptions)
  return Amplify
}

export { createAmplify }
