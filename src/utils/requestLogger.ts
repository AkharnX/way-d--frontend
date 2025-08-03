import { logError } from './errorUtils';

interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response?: {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
  };
  error?: any;
  duration: number;
}

class RequestLogger {
  private logs: RequestLog[] = [];
  private maxLogs = 100; // Keep last 100 requests

  log(request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  }, response?: {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
  }, error?: any, startTime?: number): void {
    
    const now = Date.now();
    const duration = startTime ? now - startTime : 0;
    
    const logEntry: RequestLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
      response: response ? {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: this.sanitizeHeaders(response.headers)
      } : undefined,
      error: error ? {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      } : undefined,
      duration
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log authentication-related requests with more detail
    if (this.isAuthRequest(request.url)) {
      console.group(`🔐 Auth Request: ${request.method} ${request.url}`);
      console.log('Request Headers:', this.sanitizeHeaders(request.headers));
      console.log('Request Body:', this.sanitizeBody(request.body));
      
      if (response) {
        console.log(`Response: ${response.status} ${response.statusText}`);
        console.log('Response Data:', response.data);
      }
      
      if (error) {
        console.error('Error:', error);
        console.error('Error Response:', error.response?.data);
      }
      
      console.log(`Duration: ${duration}ms`);
      console.groupEnd();
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('wayd_request_logs', JSON.stringify(this.logs.slice(-20))); // Keep last 20 in storage
    } catch (e) {
      // Storage might be full, ignore
    }
  }

  private isAuthRequest(url: string): boolean {
    return url.includes('/api/auth') || url.includes('/login') || url.includes('/refresh') || url.includes('/me');
  }

  private sanitizeHeaders(headers: Record<string, string> | undefined): Record<string, string> {
    if (!headers) return {};
    
    const sanitized = { ...headers };
    
    // Hide sensitive headers but show they exist
    if (sanitized.Authorization) {
      sanitized.Authorization = sanitized.Authorization.startsWith('Bearer ') 
        ? `Bearer ${sanitized.Authorization.substring(7, 27)}...` 
        : 'HIDDEN';
    }
    
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    if (typeof body === 'object') {
      const sanitized = { ...body };
      
      // Hide passwords but show they exist
      if (sanitized.password) {
        sanitized.password = '***HIDDEN***';
      }
      
      // Hide refresh tokens but show they exist
      if (sanitized.refresh_token) {
        sanitized.refresh_token = `${sanitized.refresh_token.substring(0, 20)}...`;
      }
      
      return sanitized;
    }
    
    return body;
  }

  getLogs(): RequestLog[] {
    return [...this.logs];
  }

  getAuthLogs(): RequestLog[] {
    return this.logs.filter(log => this.isAuthRequest(log.url));
  }

  getFailedRequests(): RequestLog[] {
    return this.logs.filter(log => log.error || (log.response && log.response.status >= 400));
  }

  clear(): void {
    this.logs = [];
    localStorage.removeItem('wayd_request_logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  static fromStorage(): RequestLog[] {
    try {
      const stored = localStorage.getItem('wayd_request_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

// Singleton instance
export const requestLogger = new RequestLogger();

// Axios interceptor helper
export const createRequestLoggerInterceptor = () => {
  return {
    request: (config: any) => {
      // Store start time for duration calculation
      config.metadata = { startTime: Date.now() };
      
      requestLogger.log({
        method: config.method?.toUpperCase() || 'GET',
        url: config.url || '',
        headers: config.headers || {},
        body: config.data
      }, undefined, undefined, config.metadata.startTime);
      
      return config;
    },
    
    response: (response: any) => {
      const config = response.config;
      const startTime = config?.metadata?.startTime;
      
      requestLogger.log({
        method: config?.method?.toUpperCase() || 'GET',
        url: config?.url || '',
        headers: config?.headers || {},
        body: config?.data
      }, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      }, undefined, startTime);
      
      return response;
    },
    
    error: (error: any) => {
      const config = error.config;
      const startTime = config?.metadata?.startTime;
      
      requestLogger.log({
        method: config?.method?.toUpperCase() || 'GET',
        url: config?.url || '',
        headers: config?.headers || {},
        body: config?.data
      }, error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : undefined, error, startTime);
      
      return Promise.reject(error);
    }
  };
};

// Helper function to analyze login failures
export const analyzeLoginFailures = (): {
  totalAttempts: number;
  failures: number;
  successRate: number;
  commonErrors: Array<{ error: string; count: number }>;
  recentFailures: RequestLog[];
} => {
  const authLogs = requestLogger.getAuthLogs();
  const loginAttempts = authLogs.filter(log => 
    log.url.includes('/login') && log.method === 'POST'
  );
  
  const failures = loginAttempts.filter(log => 
    log.error || (log.response && log.response.status >= 400)
  );
  
  const successRate = loginAttempts.length > 0 
    ? ((loginAttempts.length - failures.length) / loginAttempts.length) * 100 
    : 0;
  
  // Count common errors
  const errorCounts: Record<string, number> = {};
  failures.forEach(failure => {
    const errorKey = failure.error?.message || 
                    `${failure.response?.status} ${failure.response?.statusText}` ||
                    'Unknown error';
    errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
  });
  
  const commonErrors = Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalAttempts: loginAttempts.length,
    failures: failures.length,
    successRate: Math.round(successRate * 100) / 100,
    commonErrors,
    recentFailures: failures.slice(-5) // Last 5 failures
  };
};
