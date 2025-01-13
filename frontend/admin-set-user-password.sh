#!/bin/bash

# Cognito User Pool ID とユーザー名、パスワードを指定
USER_POOL_ID="ap-northeast-1_oEn1lXLL0"      # Cognito ユーザープールIDを設定
USERNAME="nakaya163"              # ユーザー名
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
  