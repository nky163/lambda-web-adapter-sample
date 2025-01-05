#!/bin/bash

echo 'START INIT SECRET!!'

# Install jq
apt-get update && apt-get install -y jq

# Get the current directory
CURRENT_DIR=$(dirname "$0")

# Load JSON configuration file
CONFIG_FILE="${CURRENT_DIR}/secrets-config.template.json"
CONFIG_TEMPLATE=$(cat $CONFIG_FILE)

# 環境変数で置き換え
CONFIG_CONTENT=$(echo "$CONFIG_TEMPLATE" | sed \
    -e "s/{APP_USER_SECRET_ARN}/${APP_USER_SECRET_ARN}/g" \
    -e "s/{MASTER_USER_SECRET_ARN}/${MASTER_USER_SECRET_ARN}/g" \
    -e "s/{POSTGRES_HOST}/${POSTGRES_HOST}/g" \
    -e "s/{POSTGRES_PORT}/${POSTGRES_PORT}/g" \
    -e "s/{POSTGRES_USER}/${POSTGRES_USER}/g" \
    -e "s/{POSTGRES_PASSWORD}/${POSTGRES_PASSWORD}/g" \
    -e "s/{POSTGRES_DB}/${POSTGRES_DB}/g")

# Iterate over keys and create secrets
for key in $(echo "${CONFIG_CONTENT}" | jq -r 'keys[]'); do
    value=$(echo "${CONFIG_CONTENT}" | jq -r ".${key}")
    # Check if the value is an array or an object
    if echo "${value}" | jq -e 'type == "array" or type == "object"' > /dev/null; then
        # JSON format: no double quotes
        echo "key:${key}"
        echo "value:${value}"
        aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name "${key}" --secret-string "${value}"
    else
        # String format: add double quotes
        echo "key:${key}"
        echo "value:${value}"
        aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name "${key}" --secret-string "\"${value}\""
    fi
done

echo 'END INIT SECRET!!'
exit 0