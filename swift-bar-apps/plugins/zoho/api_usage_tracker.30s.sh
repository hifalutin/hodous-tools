#!/bin/bash
#<swiftbar.title>API Usage Tracker</swiftbar.title>
#<swiftbar.refresh>30</swiftbar.refresh>
# <swiftbar.pluginPriority>999</swiftbar.pluginPriority>

DIR="$(cd "$(dirname "$0")" && pwd)"
node "$DIR/../../projects/zoho/api-usage-tracker/zoho_usage.1m.js"
echo "---"
echo "Log & Refresh | bash=\"$DIR/../../projects/zoho/api-usage-tracker/log_and_refresh.sh\" terminal=false refresh=true" 