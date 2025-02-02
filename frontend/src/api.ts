import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'

// APIレスポンスの型定義例
export interface ApiResponse<T> {
  data: T
  status: string
}

// エラーレスポンスの型定義例
export interface ApiErrorResponse {
  statusCode: number
  message: string
}

// Axiosインスタンスの作成
const api: AxiosInstance = axios.create({
  baseURL: 'https://hg0trlj3ii.execute-api.ap-northeast-1.amazonaws.com/prod/api', // 共通のエンドポイント
  timeout: 10000, // タイムアウト
  headers: {
    'Content-Type': 'application/json', // 共通のContent-Type
  },
})

// リクエストインターセプター
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers.Authorization = `Bearer ${(await fetchAuthSession()).tokens?.idToken}`
    config.headers['x-api-key'] = ''
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// レスポンスインターセプター: 共通エラーハンドリング
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // サーバーエラー
      console.error(
        `[API Error]: ${error.response.status} - ${error.response.data.message || 'Unexpected error'}`,
      )
    } else if (error.request) {
      // ネットワークエラー
      console.error('[Network Error]: Unable to reach the server.')
    } else {
      // その他のエラー
      console.error(`[Unknown Error]: ${error.message}`)
    }

    // 必要に応じてエラー内容を加工してスロー
    const apiError: ApiErrorResponse = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected error occurred.',
    }
    return Promise.reject(apiError)
  },
)

export default api
