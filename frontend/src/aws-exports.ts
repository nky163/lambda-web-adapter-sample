import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

const resourceConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-1_u2yLzuJ44',
      userPoolClientId: '5977qfd82k43vnpqv0699p8mm4',
    }
  },
  API: {
    REST: {
      MyAPIGatewayAPI: {
        endpoint: 'https://d1nll46d8agv92.cloudfront.net/api'
      }
    }
  }
}

const libraryOptions = {
  API: {
    REST: {
      headers: async() => {
        return {Authorization: `Bearer ${(await fetchAuthSession()).tokens?.idToken}` }
      }
    }
  }
}

// すでに作成済みの Cognito リソースの情報を手動で入れる
const createAmplify  = () => {
  Amplify.configure(
    resourceConfig,
    libraryOptions
  )
  return Amplify
}

export { createAmplify }