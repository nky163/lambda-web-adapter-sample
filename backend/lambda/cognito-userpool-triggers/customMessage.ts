import { hello } from "../../lib/util/hello";
export const handler = async (event: any) => {
  // どのステップのトリガーか判別 (signUp, resendCode, forgotPassword など)
  const triggerSource = event.triggerSource;

  if (triggerSource === 'CustomMessage_SignUp') {
    // サインアップ時の認証コード送信
    event.response.smsMessage = `【会員登録】認証コードは ${event.request.codeParameter} です。`;
  } else if (triggerSource === 'CustomMessage_ForgotPassword') {
    // パスワードリセット時の認証コード送信
    event.response.smsMessage = `【パスワード再設定】認証コードは ${event.request.codeParameter} です。`;
  } else {
    // 上記以外は共通メッセージ
    event.response.smsMessage = `CognitoからのSMS: コードは ${event.request.codeParameter} です。${hello()}`;
  }

  // メッセージ本文を上書き (メール用も同様に event.response.emailSubject / emailMessage を編集可)
  return event;
};
