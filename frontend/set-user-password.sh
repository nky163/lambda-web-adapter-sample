#!/bin/bash

# Cognito User Pool ID とユーザー名、パスワードを指定
USER_POOL_ID=""      # Cognito ユーザープールIDを設定
USERNAME=""              # ユーザー名
NEW_PASSWORD=""   # 新しいパスワード

# パスワードを強制的に変更させるかどうか
PERMANENT=true  # true: 次回ログイン時にパスワード変更を強制しない

# admin-set-user-password コマンドを実行
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --password "$NEW_PASSWORD" \
  --permanent \
  --profile "$PROFILE"
  
# 実行結果の確認
if [ $? -eq 0 ]; then
  echo "✅ ユーザー ($USERNAME) のパスワードが正常に設定されました。"
else
  echo "❌ ユーザー ($USERNAME) のパスワード設定に失敗しました。"
fi
