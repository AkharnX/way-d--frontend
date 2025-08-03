import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Separator } from './ui';
import { RefreshCw, Trash2, Download, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { requestLogger, analyzeLoginFailures } from '../utils/requestLogger';

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

const RequestLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'auth' | 'errors'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const refreshLogs = () => {
    let filteredLogs: RequestLog[] = [];
    
    switch (filter) {
      case 'auth':
        filteredLogs = requestLogger.getAuthLogs();
        break;
      case 'errors':
        filteredLogs = requestLogger.getFailedRequests();
        break;
      default:
        filteredLogs = requestLogger.getLogs();
    }
    
    setLogs(filteredLogs.slice(-50)); // Show last 50 logs
    setAnalysis(analyzeLoginFailures());
  };

  const clearLogs = () => {
    requestLogger.clear();
    refreshLogs();
  };

  const downloadLogs = () => {
    const logData = requestLogger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wayd-request-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (log: RequestLog) => {
    if (log.error) return 'text-red-600 bg-red-50';
    if (log.response?.status && log.response.status >= 400) return 'text-red-600 bg-red-50';
    if (log.response?.status && log.response.status >= 300) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (log: RequestLog) => {
    if (log.error || (log.response?.status && log.response.status >= 400)) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (log.response?.status && log.response.status >= 300) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Request Logs Viewer</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({requestLogger.getLogs().length})
          </Button>
          <Button
            variant={filter === 'auth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('auth')}
          >
            Auth ({requestLogger.getAuthLogs().length})
          </Button>
          <Button
            variant={filter === 'errors' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('errors')}
          >
            Errors ({requestLogger.getFailedRequests().length})
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearLogs} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Login Analysis */}
      {analysis && filter === 'auth' && (
        <Card>
          <CardHeader>
            <CardTitle>Login Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analysis.totalAttempts}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analysis.failures}</div>
                <div className="text-sm text-gray-600">Failures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analysis.recentFailures.length}</div>
                <div className="text-sm text-gray-600">Recent Failures</div>
              </div>
            </div>
            
            {analysis.commonErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Common Errors:</h4>
                <div className="space-y-1">
                  {analysis.commonErrors.slice(0, 5).map((error: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-red-600">{error.error}</span>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Request Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs found</p>
            ) : (
              logs.map((log, index) => {
                const logId = `${log.timestamp}-${index}`;
                const isExpanded = expandedLogId === logId;
                
                return (
                  <div
                    key={logId}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-gray-50 ${getStatusColor(log)}`}
                    onClick={() => toggleLogExpansion(logId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log)}
                        <Badge variant="outline">{log.method}</Badge>
                        <span className="font-mono text-sm">{log.url}</span>
                        {log.response && (
                          <Badge variant={log.response.status >= 400 ? 'destructive' : 'default'}>
                            {log.response.status}
                          </Badge>
                        )}
                        {log.error && (
                          <Badge variant="destructive">ERROR</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{log.duration}ms</span>
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t pt-3">
                        {/* Request Details */}
                        <div>
                          <h5 className="font-medium mb-1">Request Headers:</h5>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.headers, null, 2)}
                          </pre>
                        </div>
                        
                        {log.body && (
                          <div>
                            <h5 className="font-medium mb-1">Request Body:</h5>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.body, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.response && (
                          <div>
                            <h5 className="font-medium mb-1">Response:</h5>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify({
                                status: log.response.status,
                                statusText: log.response.statusText,
                                data: log.response.data
                              }, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.error && (
                          <div>
                            <h5 className="font-medium mb-1 text-red-600">Error:</h5>
                            <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto text-red-800">
                              {JSON.stringify(log.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestLogsViewer;
