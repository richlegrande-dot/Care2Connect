#!/usr/bin/env ts-node
/**
 * Startup Doctor - Non-Interactive Preflight Diagnostic
 * 
 * Runs comprehensive checks before server startup to detect and report:
 * - Running Node.js processes (potential port conflicts)
 * - PM2 daemon state and process management issues
 * - Port conflicts on critical ports (3000, 3001, 3003)
 * - Required environment variables for current mode
 * - Configuration inconsistencies
 * 
 * Returns exit code:
 * - 0: READY TO START
 * - 1: BLOCKED (critical issues found)
 * 
 * Usage:
 *   ts-node scripts/startup-doctor.ts
 *   npm run doctor
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticResult {
  category: string;
  status: 'OK' | 'WARNING' | 'BLOCKED';
  message: string;
  details?: string[];
  action?: string;
}

class StartupDoctor {
  private results: DiagnosticResult[] = [];
  private hasBlockers = false;

  /**
   * Run all diagnostic checks
   */
  async diagnose(): Promise<void> {
    console.log('🔍 STARTUP DOCTOR - Preflight Diagnostic');
    console.log('========================================\n');

    await this.checkNodeProcesses();
    await this.checkPM2State();
    await this.checkPortConflicts();
    await this.checkEnvironmentVariables();
    await this.checkConfiguration();
    
    this.printReport();
  }

  /**
   * Check for running Node.js processes
   */
  private async checkNodeProcesses(): Promise<void> {
    try {
      const output = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const lines = output.trim().split('\n').filter(line => line.includes('node.exe'));
      
      if (lines.length === 0) {
        this.results.push({
          category: 'Node Processes',
          status: 'OK',
          message: 'No existing Node.js processes detected'
        });
      } else {
        const pids = lines.map(line => {
          const match = line.match(/"(\d+)"/);
          return match ? match[1] : 'unknown';
        });

        // Check if these are Care2system related
        const details = [`Found ${lines.length} Node.js process(es): PIDs ${pids.join(', ')}`];
        
        this.results.push({
          category: 'Node Processes',
          status: 'WARNING',
          message: `${lines.length} Node.js process(es) running`,
          details,
          action: 'If stale, run: taskkill /F /IM node.exe'
        });
      }
    } catch (error) {
      // No node processes found (tasklist returns error if no matches)
      this.results.push({
        category: 'Node Processes',
        status: 'OK',
        message: 'No Node.js processes detected'
      });
    }
  }

  /**
   * Check PM2 daemon and process state
   */
  private async checkPM2State(): Promise<void> {
    try {
      const pm2List = execSync('pm2 jlist', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const processes = JSON.parse(pm2List);
      
      if (processes.length === 0) {
        this.results.push({
          category: 'PM2 State',
          status: 'OK',
          message: 'PM2 daemon running, no managed processes'
        });
      } else {
        const care2Processes = processes.filter((p: any) => 
          p.name?.includes('care') || p.name?.includes('backend') || p.name?.includes('frontend')
        );

        if (care2Processes.length > 0) {
          const details = care2Processes.map((p: any) => 
            `${p.name} (PID: ${p.pid}, Status: ${p.pm2_env?.status}, Memory: ${p.monit?.memory || 0}b)`
          );

          // Check for zombie processes (online but 0 memory)
          const zombies = care2Processes.filter((p: any) => 
            p.pm2_env?.status === 'online' && (!p.monit?.memory || p.monit.memory < 1000)
          );

          if (zombies.length > 0) {
            this.results.push({
              category: 'PM2 State',
              status: 'BLOCKED',
              message: `${zombies.length} zombie process(es) detected (online but 0 memory)`,
              details,
              action: 'Run: pm2 kill && pm2 delete all'
            });
            this.hasBlockers = true;
          } else {
            this.results.push({
              category: 'PM2 State',
              status: 'WARNING',
              message: `${care2Processes.length} Care2system process(es) already running`,
              details,
              action: 'If restarting, run: pm2 restart all OR pm2 delete all'
            });
          }
        } else {
          this.results.push({
            category: 'PM2 State',
            status: 'OK',
            message: `PM2 managing ${processes.length} process(es), none are Care2system`
          });
        }
      }
    } catch (error) {
      const err = error as Error;
      if (err.message?.includes('daemon not launched')) {
        this.results.push({
          category: 'PM2 State',
          status: 'OK',
          message: 'PM2 daemon not running (clean state)'
        });
      } else {
        this.results.push({
          category: 'PM2 State',
          status: 'WARNING',
          message: 'Could not check PM2 state',
          details: [err.message]
        });
      }
    }
  }

  /**
   * Check for port conflicts on critical ports
   */
  private async checkPortConflicts(): Promise<void> {
    const criticalPorts = [3000, 3001, 3003];
    const conflicts: string[] = [];

    for (const port of criticalPorts) {
      try {
        const output = execSync(`netstat -ano | findstr :${port}`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });

        const lines = output.trim().split('\n').filter(line => 
          line.includes('LISTENING') || line.includes('ESTABLISHED')
        );

        if (lines.length > 0) {
          const pidMatches = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1];
          });
          const uniquePids = [...new Set(pidMatches)];
          conflicts.push(`Port ${port}: in use by PID(s) ${uniquePids.join(', ')}`);
        }
      } catch (error) {
        // Port not in use (netstat returns error if no matches)
      }
    }

    if (conflicts.length === 0) {
      this.results.push({
        category: 'Port Availability',
        status: 'OK',
        message: 'All critical ports (3000, 3001, 3003) available'
      });
    } else {
      // Determine if backend port is blocked
      const backendPort = process.env.BACKEND_PORT || process.env.PORT || '3001';
      const backendBlocked = conflicts.some(c => c.includes(`Port ${backendPort}:`));

      this.results.push({
        category: 'Port Availability',
        status: backendBlocked ? 'BLOCKED' : 'WARNING',
        message: `${conflicts.length} port(s) in use`,
        details: conflicts,
        action: backendBlocked 
          ? `Critical: Backend port ${backendPort} is blocked. Kill the process or change BACKEND_PORT.`
          : 'Check if these ports are needed for your services'
      });

      if (backendBlocked) {
        this.hasBlockers = true;
      }
    }
  }

  /**
   * Check required environment variables
   */
  private async checkEnvironmentVariables(): Promise<void> {
    const required: { [key: string]: string[] } = {
      'always': ['DATABASE_URL'],
      'zero-openai': ['ASSEMBLYAI_API_KEY'],
      'production': ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY']
    };

    const mode = process.env.V1_STABLE === 'true' || process.env.AI_PROVIDER === 'rules' 
      ? 'zero-openai' 
      : 'production';
    
    const envMode = process.env.NODE_ENV || 'development';

    const missing: string[] = [];
    const placeholder: string[] = [];

    // Check always-required vars
    for (const varName of required.always) {
      const value = process.env[varName];
      if (!value) {
        missing.push(varName);
      }
    }

    // Check mode-specific vars
    if (required[mode]) {
      for (const varName of required[mode]) {
        const value = process.env[varName];
        if (!value) {
          missing.push(varName);
        } else if (value.includes('placeholder') || value.includes('your_') || value.includes('xxxx')) {
          placeholder.push(varName);
        }
      }
    }

    if (missing.length === 0 && placeholder.length === 0) {
      this.results.push({
        category: 'Environment Variables',
        status: 'OK',
        message: `All required variables present for ${mode} mode`
      });
    } else {
      const details: string[] = [];
      if (missing.length > 0) {
        details.push(`Missing: ${missing.join(', ')}`);
      }
      if (placeholder.length > 0) {
        details.push(`Placeholder values: ${placeholder.join(', ')}`);
      }

      const isBlocking = missing.includes('DATABASE_URL') || 
                        (mode === 'zero-openai' && missing.includes('ASSEMBLYAI_API_KEY'));

      this.results.push({
        category: 'Environment Variables',
        status: isBlocking ? 'BLOCKED' : 'WARNING',
        message: `${missing.length + placeholder.length} variable issue(s) detected`,
        details,
        action: isBlocking 
          ? 'Critical variables missing. Check backend/.env file.'
          : 'Non-critical variables missing. Server will run in demo mode.'
      });

      if (isBlocking) {
        this.hasBlockers = true;
      }
    }
  }

  /**
   * Check configuration consistency
   */
  private async checkConfiguration(): Promise<void> {
    const issues: string[] = [];

    // Check if multiple ecosystem configs exist
    const rootDir = path.resolve(__dirname, '../..');
    const ecosystemConfigs = [
      'ecosystem.config.js',
      'ecosystem.dev.config.js',
      'ecosystem.prod.config.js'
    ].filter(file => fs.existsSync(path.join(rootDir, file)));

    if (ecosystemConfigs.length > 2) {
      issues.push(`Multiple PM2 configs found: ${ecosystemConfigs.join(', ')}`);
    }

    // Check for port mismatches
    const backendPort = process.env.BACKEND_PORT || process.env.PORT || '3001';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    if (apiUrl && !apiUrl.includes(backendPort) && !apiUrl.includes('care2connect')) {
      issues.push(`Port mismatch: BACKEND_PORT=${backendPort} but NEXT_PUBLIC_API_URL=${apiUrl}`);
    }

    // Check V1 mode consistency
    const v1Stable = process.env.V1_STABLE === 'true';
    const aiProvider = process.env.AI_PROVIDER || 'none';
    const hasOpenAIKey = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder');

    if (v1Stable && hasOpenAIKey && aiProvider !== 'openai') {
      issues.push('V1_STABLE=true but OPENAI_API_KEY is set (will be ignored)');
    }

    if (issues.length === 0) {
      this.results.push({
        category: 'Configuration',
        status: 'OK',
        message: 'No configuration inconsistencies detected'
      });
    } else {
      this.results.push({
        category: 'Configuration',
        status: 'WARNING',
        message: `${issues.length} configuration warning(s)`,
        details: issues,
        action: 'Review configuration for consistency'
      });
    }
  }

  /**
   * Print diagnostic report
   */
  private printReport(): void {
    console.log('\n📋 DIAGNOSTIC REPORT');
    console.log('====================\n');

    const okCount = this.results.filter(r => r.status === 'OK').length;
    const warnCount = this.results.filter(r => r.status === 'WARNING').length;
    const blockCount = this.results.filter(r => r.status === 'BLOCKED').length;

    for (const result of this.results) {
      const icon = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${icon} [${result.category}] ${result.message}`);
      
      if (result.details) {
        result.details.forEach(detail => {
          console.log(`   ${detail}`);
        });
      }
      
      if (result.action) {
        console.log(`   → Action: ${result.action}`);
      }
      
      console.log('');
    }

    console.log('==================== \n');
    console.log(`Summary: ${okCount} OK, ${warnCount} WARNING, ${blockCount} BLOCKED\n`);

    if (this.hasBlockers) {
      console.log('🚨 VERDICT: BLOCKED - Critical issues must be resolved before startup\n');
      process.exit(1);
    } else if (warnCount > 0) {
      console.log('⚠️  VERDICT: READY WITH WARNINGS - Server can start but review warnings\n');
      process.exit(0);
    } else {
      console.log('✅ VERDICT: READY TO START - All checks passed\n');
      process.exit(0);
    }
  }
}

// Run diagnostics
const doctor = new StartupDoctor();
doctor.diagnose().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
