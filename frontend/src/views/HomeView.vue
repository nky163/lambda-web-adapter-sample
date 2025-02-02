<script setup lang="ts">
import { get } from 'aws-amplify/api'
import TheWelcome from '../components/TheWelcome.vue'
import { signIn, confirmSignIn, signOut } from 'aws-amplify/auth'
import api, { type ApiResponse } from '../api'

import { ref } from 'vue'

const signInInput = ref({
  username: '',
  password: '',
})

const confirmationCode = ref('')

const handleSignIn = async () => {
  const res = await signIn(signInInput.value)
  console.log(res)
}

const handleConfirmSignIn = async () => {
  const res = await confirmSignIn({ challengeResponse: confirmationCode.value })
  console.log(res)
}

const handleSignOut = async () => {
  const res = await signOut()
  console.log(res)
}

const handleAPI = async () => {
  const res = await api.get<ApiResponse<any>>('/users')
  console.log(res)
  // const res =  get({apiName: 'MyAPIGatewayAPI', path: '/users'})
  // console.log(await res.response)
}
</script>

<template>
  <main>
    <input type="text" v-model="signInInput.username" />
    <input type="text" v-model="signInInput.password" />
    <button @click="handleSignIn">ログイン</button>
    <input type="text" v-model="confirmationCode" />
    <button @click="handleConfirmSignIn">コード送信</button>
    <button @click="handleSignOut">サインアウト</button>
    <button @click="handleAPI">API呼び出し</button>
  </main>
</template>
