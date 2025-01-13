#!/bin/bash

USER_POOL_ID="ap-northeast-1_oEn1lXLL0"
USERNAME="nakaya163"
PHONE_NUMBER="+818014973693"
EMAIL="nky8888163@gmail.com"


aws cognito-idp admin-create-user \
    --user-pool-id "${USER_POOL_ID}" \
    --username "$USERNAME" \
    --user-attributes Name=email,Value="$EMAIL" Name=phone_number,Value="$PHONE_NUMBER" \
    --message-action SUPPRESS \
    --desired-delivery-mediums SMS 2>&1

