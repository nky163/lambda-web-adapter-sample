USER_POOL_ID="ap-northeast-1_oEn1lXLL0"
USERNAME="nakaya163"

aws cognito-idp admin-update-user-attributes \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --user-attributes Name=email_verified,Value=true Name=phone_number_verified,Value=true 2>&1