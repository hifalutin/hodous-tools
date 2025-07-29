#!/usr/bin/env /opt/homebrew/bin/node
import http from 'http';

const url =
  'http://127.0.0.1:5001/hodous-tools/us-central1/getZohoApiUsageSummary';

function fetchUsage() {
  http
    .get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            const { usageCount, date, latestRequestTime, latestRequestPath } =
              json.data;
            const displayTime = latestRequestTime
              ? new Date(latestRequestTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'n/a';
            console.log(
              `${usageCount} (${Math.round(
                (usageCount / 5000) * 100
              )}%) ${displayTime}`
            );
          } else {
            console.log('📊 n/a');
          }
          console.log('---');
          if (json.success) {
            const { usageCount, date, latestRequestTime, latestRequestPath } =
              json.data;
            console.log(`Calls Used: ${usageCount}`);
            console.log(`% Used: ${((usageCount / 5000) * 100).toFixed(1)}%`);
            console.log(`Current Date: ${date}`);
            console.log(
              `Last Call Time: ${
                latestRequestTime
                  ? new Date(latestRequestTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'n/a'
              }`
            );
            console.log(`Path: ${latestRequestPath || 'n/a'}`);
          } else {
            console.log(
              `Error: ${json.error || 'Failed to fetch usage data.'}`
            );
          }
        } catch (err) {
          console.log('Error parsing response:', err.message);
        }
      });
    })
    .on('error', (err) => {
      console.log('Request error:', err.message);
    });
}

fetchUsage();
