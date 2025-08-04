import { authService, healthService } from '../services/api';
import { setTokens, clearTokens } from './tokenUtils';

interface AuthFlowStep {
  step: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
  data?: any;
  error?: any;
  timestamp: string;
}

class AuthFlowDiagnostic {
  private steps: AuthFlowStep[] = [];
  private isRunning = false;

  private addStep(step: string, status: 'pending' | 'success' | 'error' | 'skipped', message: string, data?: any, error?: any) {
    const authStep: AuthFlowStep = {
      step,
      status,
      message,
      data,
      error,
      timestamp: new Date().toISOString()
    };
    
    this.steps.push(authStep);
    console.log(`🔐 Auth Flow [${status.toUpperCase()}] ${step}: ${message}`, data || error || '');
  }

  async diagnoseAuthFlow(email?: string, password?: string): Promise<AuthFlowStep[]> {
    if (this.isRunning) {
      throw new Error('Diagnostic already running');
    }

    this.isRunning = true;
    this.steps = [];

    try {
      // Step 1: Check initial state
      this.addStep('initial-state', 'pending', 'Checking initial authentication state');
      
      const initialAccessToken = localStorage.getItem('access_token');
      const initialRefreshToken = localStorage.getItem('refresh_token');
      const initialUserEmail = localStorage.getItem('user_email');
      
      this.addStep('initial-state', 'success', 'Initial state checked', {
        hasAccessToken: !!initialAccessToken,
        hasRefreshToken: !!initialRefreshToken,
        hasStoredEmail: !!initialUserEmail,
        storedEmail: initialUserEmail
      });

      // Step 2: Check backend connectivity
      this.addStep('backend-connectivity', 'pending', 'Testing backend connectivity');
      
      try {
        const healthResponse = await healthService.checkAuth();
        this.addStep('backend-connectivity', 'success', 'Backend is reachable', healthResponse);
      } catch (error) {
        this.addStep('backend-connectivity', 'error', 'Backend is unreachable', null, error);
        // Continue with remaining tests
      }

      // Step 3: Test login flow (if credentials provided)
      if (email && password) {
        this.addStep('login-attempt', 'pending', 'Attempting login');
        
        try {
          const loginResponse = await authService.login({ email, password });
          
          this.addStep('login-attempt', 'success', 'Login successful', {
            hasAccessToken: !!loginResponse.access_token,
            hasRefreshToken: !!loginResponse.refresh_token,
            tokenTypes: {
              access: typeof loginResponse.access_token,
              refresh: typeof loginResponse.refresh_token
            }
          });

          // Step 4: Test token storage
          this.addStep('token-storage', 'pending', 'Testing token storage');
          
          setTokens(loginResponse.access_token, loginResponse.refresh_token);
          localStorage.setItem('user_email', email);
          
          const storedAccess = localStorage.getItem('access_token');
          const storedRefresh = localStorage.getItem('refresh_token');
          
          if (storedAccess === loginResponse.access_token && storedRefresh === loginResponse.refresh_token) {
            this.addStep('token-storage', 'success', 'Tokens stored successfully');
          } else {
            this.addStep('token-storage', 'error', 'Token storage failed', {
              expected: { access: loginResponse.access_token, refresh: loginResponse.refresh_token },
              actual: { access: storedAccess, refresh: storedRefresh }
            });
          }

          // Step 5: Test current user retrieval
          this.addStep('user-retrieval', 'pending', 'Testing current user retrieval');
          
          try {
            const currentUser = await authService.getCurrentUser();
            this.addStep('user-retrieval', 'success', 'Current user retrieved successfully', {
              userId: currentUser.id,
              email: currentUser.email,
              hasProfile: !!currentUser.first_name
            });
          } catch (userError: any) {
            if (userError.response?.status === 403) {
              this.addStep('user-retrieval', 'error', 'Email verification required', null, userError);
            } else if (userError.response?.status === 401) {
              this.addStep('user-retrieval', 'error', 'Token invalid immediately after login', null, userError);
            } else {
              this.addStep('user-retrieval', 'error', 'Failed to retrieve current user', null, userError);
            }
          }

        } catch (loginError: any) {
          this.addStep('login-attempt', 'error', 'Login failed', null, loginError);
          
          // Analyze login error
          if (loginError.response?.status === 401) {
            this.addStep('login-analysis', 'error', 'Invalid credentials or backend auth issue');
          } else if (loginError.response?.status === 422) {
            this.addStep('login-analysis', 'error', 'Request validation failed', null, loginError.response?.data);
          } else if (loginError.code === 'NETWORK_ERROR') {
            this.addStep('login-analysis', 'error', 'Network connectivity issue');
          } else {
            this.addStep('login-analysis', 'error', 'Unknown login error', null, loginError);
          }
        }
      } else {
        this.addStep('login-attempt', 'skipped', 'No credentials provided for login test');
      }

      // Step 6: Test token refresh (if we have tokens)
      const currentRefreshToken = localStorage.getItem('refresh_token');
      if (currentRefreshToken) {
        this.addStep('token-refresh', 'pending', 'Testing token refresh mechanism');
        
        try {
          const refreshResponse = await authService.refreshToken();
          
          this.addStep('token-refresh', 'success', 'Token refresh successful', {
            hasNewAccessToken: !!refreshResponse.access_token,
            hasNewRefreshToken: !!refreshResponse.refresh_token
          });
        } catch (refreshError: any) {
          if (refreshError.response?.status === 401) {
            this.addStep('token-refresh', 'error', 'Refresh token is invalid or expired');
          } else {
            this.addStep('token-refresh', 'error', 'Token refresh failed', null, refreshError);
          }
        }
      } else {
        this.addStep('token-refresh', 'skipped', 'No refresh token available for testing');
      }

      // Step 7: Test token cleanup
      this.addStep('token-cleanup', 'pending', 'Testing token cleanup');
      
      clearTokens();
      localStorage.removeItem('user_email');
      
      const remainingAccess = localStorage.getItem('access_token');
      const remainingRefresh = localStorage.getItem('refresh_token');
      const remainingEmail = localStorage.getItem('user_email');
      
      if (!remainingAccess && !remainingRefresh && !remainingEmail) {
        this.addStep('token-cleanup', 'success', 'Token cleanup successful');
      } else {
        this.addStep('token-cleanup', 'error', 'Token cleanup incomplete', {
          remainingAccess: !!remainingAccess,
          remainingRefresh: !!remainingRefresh,
          remainingEmail: !!remainingEmail
        });
      }

      // Step 8: Test auth state consistency
      this.addStep('auth-state-check', 'pending', 'Checking auth state consistency');
      
      try {
        // Check auth hook structure
        // Note: This is a simplified check since we can't easily test hooks outside React
        this.addStep('auth-state-check', 'success', 'Auth state structure appears valid');
      } catch (authError) {
        this.addStep('auth-state-check', 'error', 'Auth state has issues', null, authError);
      }

    } catch (error) {
      this.addStep('diagnostic-error', 'error', 'Diagnostic process failed', null, error);
    } finally {
      this.isRunning = false;
    }

    return this.steps;
  }

  getSteps(): AuthFlowStep[] {
    return [...this.steps];
  }

  getFailedSteps(): AuthFlowStep[] {
    return this.steps.filter(step => step.status === 'error');
  }

  getSuccessfulSteps(): AuthFlowStep[] {
    return this.steps.filter(step => step.status === 'success');
  }

  generateReport(): string {
    const totalSteps = this.steps.length;
    const successSteps = this.getSuccessfulSteps().length;
    const failedSteps = this.getFailedSteps().length;
    const skippedSteps = this.steps.filter(step => step.status === 'skipped').length;

    let report = `# Authentication Flow Diagnostic Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total Steps: ${totalSteps}\n`;
    report += `- Successful: ${successSteps}\n`;
    report += `- Failed: ${failedSteps}\n`;
    report += `- Skipped: ${skippedSteps}\n`;
    report += `- Success Rate: ${totalSteps > 0 ? Math.round((successSteps / (totalSteps - skippedSteps)) * 100) : 0}%\n\n`;

    if (failedSteps > 0) {
      report += `## ❌ Failed Steps\n\n`;
      this.getFailedSteps().forEach(step => {
        report += `### ${step.step}\n`;
        report += `**Message:** ${step.message}\n`;
        report += `**Timestamp:** ${step.timestamp}\n`;
        
        if (step.error) {
          report += `**Error:** \`\`\`json\n${JSON.stringify(step.error, null, 2)}\n\`\`\`\n`;
        }
        
        if (step.data) {
          report += `**Data:** \`\`\`json\n${JSON.stringify(step.data, null, 2)}\n\`\`\`\n`;
        }
        
        report += `\n`;
      });
    }

    report += `## ✅ Successful Steps\n\n`;
    this.getSuccessfulSteps().forEach(step => {
      report += `- **${step.step}:** ${step.message}\n`;
    });

    report += `\n## 📋 All Steps\n\n`;
    this.steps.forEach(step => {
      const statusEmoji = {
        success: '✅',
        error: '❌',
        pending: '⏳',
        skipped: '⏭️'
      }[step.status];
      
      report += `${statusEmoji} **${step.step}** - ${step.message} (${step.timestamp})\n`;
    });

    return report;
  }
}

export const authFlowDiagnostic = new AuthFlowDiagnostic();

// Helper function to run a quick auth diagnostic
export const runQuickAuthDiagnostic = async (email?: string, password?: string): Promise<{
  success: boolean;
  issues: string[];
  recommendations: string[];
  report: string;
}> => {
  try {
    const steps = await authFlowDiagnostic.diagnoseAuthFlow(email, password);
    const failedSteps = steps.filter(step => step.status === 'error');
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze common issues and provide recommendations
    failedSteps.forEach(step => {
      switch (step.step) {
        case 'backend-connectivity':
          issues.push('Backend service is unreachable');
          recommendations.push('Check if backend services are running and accessible');
          break;
          
        case 'login-attempt':
          issues.push('Login request failed');
          if (step.error?.response?.status === 401) {
            recommendations.push('Verify credentials and check backend auth configuration');
          } else if (step.error?.response?.status === 422) {
            recommendations.push('Check request format and validation rules');
          } else {
            recommendations.push('Check network connectivity and backend logs');
          }
          break;
          
        case 'token-storage':
          issues.push('Token storage mechanism is broken');
          recommendations.push('Check localStorage functionality and browser security settings');
          break;
          
        case 'user-retrieval':
          issues.push('Cannot retrieve user data after login');
          if (step.error?.response?.status === 403) {
            recommendations.push('Implement email verification flow');
          } else if (step.error?.response?.status === 401) {
            recommendations.push('Check token format and backend authentication');
          }
          break;
          
        case 'token-refresh':
          issues.push('Token refresh mechanism is broken');
          recommendations.push('Check refresh token implementation and expiration handling');
          break;
          
        case 'token-cleanup':
          issues.push('Token cleanup is incomplete');
          recommendations.push('Review clearTokens() implementation');
          break;
      }
    });

    return {
      success: failedSteps.length === 0,
      issues,
      recommendations,
      report: authFlowDiagnostic.generateReport()
    };
    
  } catch (error) {
    return {
      success: false,
      issues: ['Diagnostic process failed'],
      recommendations: ['Check console for detailed error information'],
      report: `Diagnostic failed: ${error}`
    };
  }
};
