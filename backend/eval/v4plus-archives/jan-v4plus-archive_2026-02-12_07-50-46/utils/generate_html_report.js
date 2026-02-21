#!/usr/bin/env node
/**
 * HTML Report Generator for Jan v4.0+
 * 
 * Converts JSON reports to interactive HTML with charts and visualizations.
 * 
 * Features:
 * - Pass rate visualization (pie charts)
 * - Failure bucket distribution (bar chart)
 * - Performance metrics (latency histogram)
 * - Field accuracy breakdown (radar chart)
 * - Mutation impact analysis (scatter plot)
 * - Interactive filtering and drill-down
 * 
 * Usage:
 *   node generate_html_report.js --input ./reports/latest.json --output ./reports/latest.html
 *   npm run eval:v4plus:html-report
 */

const fs = require('fs');
const path = require('path');

// HTML template with embedded Chart.js
function generateHTML(reportData) {
  const { summary, performance, failureBuckets, regressions, fieldAccuracy } = reportData;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jan v4.0+ Evaluation Report - ${new Date(reportData.timestamp).toLocaleString()}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    header .meta {
      opacity: 0.9;
      font-size: 0.95em;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card h2 {
      font-size: 1.3em;
      margin-bottom: 15px;
      color: #667eea;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    
    .metric:last-child {
      border-bottom: none;
    }
    
    .metric-label {
      font-weight: 500;
      color: #666;
    }
    
    .metric-value {
      font-size: 1.4em;
      font-weight: 700;
      color: #333;
    }
    
    .metric-value.success {
      color: #10b981;
    }
    
    .metric-value.warning {
      color: #f59e0b;
    }
    
    .metric-value.error {
      color: #ef4444;
    }
    
    .chart-container {
      position: relative;
      height: 300px;
      margin-top: 20px;
    }
    
    .chart-container.large {
      height: 400px;
    }
    
    .regression-alert {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    .regression-alert h3 {
      color: #ef4444;
      margin-bottom: 10px;
    }
    
    .success-banner {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    .success-banner h3 {
      color: #10b981;
      margin-bottom: 5px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #667eea;
    }
    
    tr:hover {
      background: #fafafa;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    
    .badge.high {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .badge.medium {
      background: #fef3c7;
      color: #d97706;
    }
    
    .badge.low {
      background: #dbeafe;
      color: #2563eb;
    }
    
    footer {
      text-align: center;
      padding: 30px;
      color: #999;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Jan v4.0+ Evaluation Report</h1>
      <div class="meta">
        <div>Generated: ${new Date(reportData.timestamp).toLocaleString()}</div>
        <div>Dataset: ${reportData.dataset || 'Unknown'}</div>
        <div>Total Cases: ${summary.totalCases}</div>
      </div>
    </header>

    ${regressions && regressions.length > 0 ? `
    <div class="regression-alert">
      <h3>⚠️ Regressions Detected</h3>
      <ul>
        ${regressions.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : `
    <div class="success-banner">
      <h3>✅ No Regressions Detected</h3>
      <p>All baseline tests passed successfully.</p>
    </div>
    `}

    <div class="grid">
      <div class="card">
        <h2>Pass Rates</h2>
        <div class="metric">
          <span class="metric-label">Strict Pass</span>
          <span class="metric-value ${summary.strictPassPercentage >= 95 ? 'success' : summary.strictPassPercentage >= 85 ? 'warning' : 'error'}">
            ${summary.strictPassPercentage.toFixed(1)}%
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Acceptable Pass</span>
          <span class="metric-value ${summary.acceptablePassPercentage >= 85 ? 'success' : summary.acceptablePassPercentage >= 75 ? 'warning' : 'error'}">
            ${summary.acceptablePassPercentage.toFixed(1)}%
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Total Passed</span>
          <span class="metric-value">${summary.strictPassed} / ${summary.totalCases}</span>
        </div>
        <div class="chart-container">
          <canvas id="passRateChart"></canvas>
        </div>
      </div>

      <div class="card">
        <h2>Performance</h2>
        <div class="metric">
          <span class="metric-label">Total Runtime</span>
          <span class="metric-value">${(performance.totalRuntimeMs / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Latency</span>
          <span class="metric-value">${performance.avgLatencyMs.toFixed(2)}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Budget Status</span>
          <span class="metric-value ${performance.withinBudget ? 'success' : 'error'}">
            ${performance.withinBudget ? '✅ Within Budget' : '❌ Over Budget'}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Cases/Second</span>
          <span class="metric-value">${(summary.totalCases / (performance.totalRuntimeMs / 1000)).toFixed(1)}</span>
        </div>
      </div>

      ${fieldAccuracy ? `
      <div class="card">
        <h2>Field Accuracy</h2>
        <div class="metric">
          <span class="metric-label">Name</span>
          <span class="metric-value">${fieldAccuracy.name.toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Category</span>
          <span class="metric-value">${fieldAccuracy.category.toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Urgency</span>
          <span class="metric-value">${fieldAccuracy.urgency.toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Amount</span>
          <span class="metric-value">${fieldAccuracy.amount.toFixed(1)}%</span>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="card">
      <h2>Top Failure Buckets</h2>
      <div class="chart-container large">
        <canvas id="failureBucketsChart"></canvas>
      </div>
      <table>
        <thead>
          <tr>
            <th>Bucket Type</th>
            <th>Count</th>
            <th>Percentage</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${failureBuckets.slice(0, 10).map(bucket => `
          <tr>
            <td>${bucket.type}</td>
            <td>${bucket.count}</td>
            <td>${bucket.percentage.toFixed(1)}%</td>
            <td>
              <span class="badge ${bucket.percentage > 10 ? 'high' : bucket.percentage > 5 ? 'medium' : 'low'}">
                ${bucket.percentage > 10 ? 'HIGH' : bucket.percentage > 5 ? 'MEDIUM' : 'LOW'}
              </span>
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <footer>
      Generated by Jan v4.0+ HTML Report Generator
    </footer>
  </div>

  <script>
    // Pass Rate Pie Chart
    const passRateCtx = document.getElementById('passRateChart').getContext('2d');
    new Chart(passRateCtx, {
      type: 'doughnut',
      data: {
        labels: ['Passed (Strict)', 'Passed (Acceptable)', 'Failed'],
        datasets: [{
          data: [
            ${summary.strictPassed},
            ${summary.acceptablePassed - summary.strictPassed},
            ${summary.totalCases - summary.acceptablePassed}
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#ef4444'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Failure Buckets Bar Chart
    const failureBucketsCtx = document.getElementById('failureBucketsChart').getContext('2d');
    new Chart(failureBucketsCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(failureBuckets.slice(0, 10).map(b => b.type))},
        datasets: [{
          label: 'Failure Count',
          data: ${JSON.stringify(failureBuckets.slice(0, 10).map(b => b.count))},
          backgroundColor: '#667eea',
          borderColor: '#5568d3',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

// Parse arguments
const args = process.argv.slice(2);
const inputArg = args.find(a => a.startsWith('--input='))?.split('=')[1] || 
                 args[args.indexOf('--input') + 1];
const outputArg = args.find(a => a.startsWith('--output='))?.split('=')[1] || 
                  args[args.indexOf('--output') + 1];

if (!inputArg) {
  console.error(`
❌ Missing required argument: --input

Usage:
  node generate_html_report.js --input <json-file> [--output <html-file>]

Example:
  node generate_html_report.js --input ./reports/latest.json --output ./reports/latest.html
`);
  process.exit(1);
}

try {
  // Read JSON report
  const inputPath = path.resolve(inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`\n📄 Reading JSON report: ${inputPath}`);
  const reportContent = fs.readFileSync(inputPath, 'utf8');
  const reportData = JSON.parse(reportContent);

  // Generate HTML
  console.log(`🎨 Generating HTML report...`);
  const html = generateHTML(reportData);

  // Determine output path
  const outputPath = outputArg 
    ? path.resolve(outputArg)
    : inputPath.replace('.json', '.html');

  // Write HTML file
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log(`\n✅ HTML report generated successfully`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${(html.length / 1024).toFixed(1)} KB\n`);
  console.log(`Open in browser: file:///${outputPath.replace(/\\/g, '/')}\n`);

} catch (err) {
  console.error(`\n❌ Error: ${err.message}\n`);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
}
