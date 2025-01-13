# なくておk
USER_POOL_ID="ap-northeast-1_oEn1lXLL0"
USERNAME="nakaya163"
aws cognito-idp admin-confirm-sign-up \
        --user-pool-id "$USER_POOL_ID" \
        --username "$USERNAME" 2>&1