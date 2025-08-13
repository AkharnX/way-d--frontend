#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequest,
    CallToolRequestSchema,
    CallToolResult,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    Resource
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import simpleGit from 'simple-git';
import { promisify } from 'util';

const execAsync = promisify(exec);

class WayDMCPServer {
    private server: Server;
    private projectRoot: string;

    constructor() {
        this.server = new Server(
            {
                name: 'way-d-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.projectRoot = process.cwd();
        this.setupToolHandlers();
        this.setupResourceHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'analyze_project_structure',
                        description: 'Analyze the Way-d project structure and provide insights',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                depth: {
                                    type: 'number',
                                    description: 'Maximum depth to analyze (default: 3)',
                                    default: 3,
                                },
                            },
                        },
                    },
                    {
                        name: 'get_api_endpoints',
                        description: 'Extract and list all API endpoints from the project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                service: {
                                    type: 'string',
                                    description: 'Specific service to analyze (optional)',
                                },
                            },
                        },
                    },
                    {
                        name: 'check_git_status',
                        description: 'Get current git status and recent commits',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                limit: {
                                    type: 'number',
                                    description: 'Number of recent commits to show (default: 10)',
                                    default: 10,
                                },
                            },
                        },
                    },
                    {
                        name: 'analyze_typescript_errors',
                        description: 'Analyze TypeScript errors and suggest fixes',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'Specific file to analyze (optional)',
                                },
                            },
                        },
                    },
                    {
                        name: 'get_component_usage',
                        description: 'Find all usages of a React component',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description: 'Name of the component to search for',
                                },
                            },
                            required: ['componentName'],
                        },
                    },
                    {
                        name: 'check_api_health',
                        description: 'Check health status of backend services',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                services: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of services to check (optional)',
                                },
                            },
                        },
                    },
                    {
                        name: 'generate_deployment_report',
                        description: 'Generate a comprehensive deployment status report',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                includeTests: {
                                    type: 'boolean',
                                    description: 'Include test results in report',
                                    default: true,
                                },
                            },
                        },
                    },
                    {
                        name: 'start_backend_services',
                        description: 'Start all Way-d backend services with Docker',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                rebuild: {
                                    type: 'boolean',
                                    description: 'Force rebuild of Docker images',
                                    default: false,
                                },
                            },
                        },
                    },
                    {
                        name: 'stop_backend_services',
                        description: 'Stop all Way-d backend services',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                removeVolumes: {
                                    type: 'boolean',
                                    description: 'Remove Docker volumes as well',
                                    default: false,
                                },
                            },
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'analyze_project_structure':
                        return await this.analyzeProjectStructure((args as any)?.depth || 3);

                    case 'get_api_endpoints':
                        return await this.getApiEndpoints((args as any)?.service);

                    case 'check_git_status':
                        return await this.checkGitStatus((args as any)?.limit || 10);

                    case 'analyze_typescript_errors':
                        return await this.analyzeTypescriptErrors((args as any)?.file);

                    case 'get_component_usage':
                        return await this.getComponentUsage((args as any)?.componentName);

                    case 'check_api_health':
                        return await this.checkApiHealth((args as any)?.services);

                    case 'generate_deployment_report':
                        return await this.generateDeploymentReport((args as any)?.includeTests ?? true);

                    case 'start_backend_services':
                        return await this.startBackendServices((args as any)?.rebuild ?? false);

                    case 'stop_backend_services':
                        return await this.stopBackendServices((args as any)?.removeVolumes ?? false);

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }

    private setupResourceHandlers() {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const resources: Resource[] = [];

            // Add project files as resources
            const files = await glob('**/*.{ts,tsx,js,jsx,md,json}', {
                cwd: this.projectRoot,
                ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            });

            for (const file of files) {
                resources.push({
                    uri: `file://${path.join(this.projectRoot, file)}`,
                    name: file,
                    mimeType: this.getMimeType(file),
                });
            }

            return { resources };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;

            if (uri.startsWith('file://')) {
                const filePath = uri.replace('file://', '');

                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const mimeType = this.getMimeType(filePath);

                    return {
                        contents: [
                            {
                                uri,
                                mimeType,
                                text: content,
                            },
                        ],
                    };
                } catch (error) {
                    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            throw new Error(`Unsupported URI scheme: ${uri}`);
        });
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.ts': 'text/typescript',
            '.tsx': 'text/typescript',
            '.js': 'text/javascript',
            '.jsx': 'text/javascript',
            '.json': 'application/json',
            '.md': 'text/markdown',
            '.css': 'text/css',
            '.html': 'text/html',
        };
        return mimeTypes[ext] || 'text/plain';
    }

    private async analyzeProjectStructure(depth: number): Promise<CallToolResult> {
        try {
            const structure = await this.getDirectoryStructure(this.projectRoot, depth);
            const packageJson = await fs.readJson(path.join(this.projectRoot, 'package.json'));

            const analysis = {
                projectName: packageJson.name,
                version: packageJson.version,
                structure,
                dependencies: Object.keys(packageJson.dependencies || {}),
                devDependencies: Object.keys(packageJson.devDependencies || {}),
                scripts: Object.keys(packageJson.scripts || {}),
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(analysis, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to analyze project structure: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async getDirectoryStructure(dir: string, maxDepth: number, currentDepth = 0): Promise<any> {
        if (currentDepth >= maxDepth) return null;

        const items = await fs.readdir(dir);
        const structure: any = {};

        for (const item of items) {
            if (item.startsWith('.') || item === 'node_modules') continue;

            const itemPath = path.join(dir, item);
            const stat = await fs.stat(itemPath);

            if (stat.isDirectory()) {
                structure[item + '/'] = await this.getDirectoryStructure(itemPath, maxDepth, currentDepth + 1);
            } else {
                structure[item] = {
                    size: stat.size,
                    modified: stat.mtime,
                };
            }
        }

        return structure;
    }

    private async getApiEndpoints(service?: string): Promise<CallToolResult> {
        try {
            const endpoints: any[] = [];
            const apiFiles = await glob('src/services/**/*.{ts,js}', { cwd: this.projectRoot });

            for (const file of apiFiles) {
                const filePath = path.join(this.projectRoot, file);
                const content = await fs.readFile(filePath, 'utf-8');

                // Extract API endpoints using regex
                const endpointRegex = /(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
                let match;

                while ((match = endpointRegex.exec(content)) !== null) {
                    endpoints.push({
                        file,
                        endpoint: match[1],
                        line: content.substring(0, match.index).split('\n').length,
                    });
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(endpoints, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to get API endpoints: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async checkGitStatus(limit: number): Promise<CallToolResult> {
        try {
            const git = simpleGit(this.projectRoot);
            const status = await git.status();
            const log = await git.log({ maxCount: limit });

            const gitInfo = {
                branch: status.current,
                ahead: status.ahead,
                behind: status.behind,
                modified: status.modified,
                created: status.created,
                deleted: status.deleted,
                renamed: status.renamed,
                recentCommits: log.all.map(commit => ({
                    hash: commit.hash.substring(0, 8),
                    message: commit.message,
                    author: commit.author_name,
                    date: commit.date,
                })),
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(gitInfo, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to check git status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async analyzeTypescriptErrors(file?: string): Promise<CallToolResult> {
        try {
            // This would typically run TypeScript compiler programmatically
            // For now, we'll simulate by checking common error patterns
            const tsFiles = file ? [file] : await glob('src/**/*.{ts,tsx}', { cwd: this.projectRoot });
            const errors: any[] = [];

            for (const tsFile of tsFiles) {
                const filePath = path.join(this.projectRoot, tsFile);
                const content = await fs.readFile(filePath, 'utf-8');

                // Check for common TypeScript issues
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('any') && !line.includes('// @ts-ignore')) {
                        errors.push({
                            file: tsFile,
                            line: index + 1,
                            type: 'warning',
                            message: 'Usage of "any" type detected',
                        });
                    }
                    if (line.includes('// @ts-ignore')) {
                        errors.push({
                            file: tsFile,
                            line: index + 1,
                            type: 'warning',
                            message: 'TypeScript error suppressed with @ts-ignore',
                        });
                    }
                });
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(errors, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to analyze TypeScript errors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async getComponentUsage(componentName: string): Promise<CallToolResult> {
        try {
            const usages: any[] = [];
            const files = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd: this.projectRoot });

            for (const file of files) {
                const filePath = path.join(this.projectRoot, file);
                const content = await fs.readFile(filePath, 'utf-8');

                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes(`<${componentName}`) || line.includes(`import.*${componentName}`)) {
                        usages.push({
                            file,
                            line: index + 1,
                            content: line.trim(),
                        });
                    }
                });
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(usages, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to get component usage: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async checkApiHealth(services?: string[]): Promise<CallToolResult> {
        try {
            const defaultServices = [
                { name: 'auth', port: 8080 },
                { name: 'profile', port: 8081 },
                { name: 'interactions', port: 8082 },
                { name: 'events', port: 8083 },
                { name: 'payments', port: 8084 },
                { name: 'notifications', port: 8085 },
                { name: 'moderation', port: 8086 },
                { name: 'analytics', port: 8087 },
                { name: 'admin', port: 8088 },
            ];

            const servicesToCheck = services
                ? defaultServices.filter(s => services.includes(s.name))
                : defaultServices;

            const healthChecks = await Promise.allSettled(
                servicesToCheck.map(async (service) => {
                    try {
                        const response = await axios.get(`http://localhost:${service.port}/health`, {
                            timeout: 5000,
                        });
                        return {
                            service: service.name,
                            port: service.port,
                            status: 'healthy',
                            response: response.data,
                        };
                    } catch (error) {
                        return {
                            service: service.name,
                            port: service.port,
                            status: 'unhealthy',
                            error: error instanceof Error ? error.message : String(error),
                        };
                    }
                })
            );

            const results = healthChecks.map((check, index) => {
                if (check.status === 'fulfilled') {
                    return check.value;
                } else {
                    return {
                        service: servicesToCheck[index].name,
                        port: servicesToCheck[index].port,
                        status: 'error',
                        error: check.reason,
                    };
                }
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to check API health: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async generateDeploymentReport(includeTests: boolean): Promise<CallToolResult> {
        try {
            const report: any = {
                timestamp: new Date().toISOString(),
                project: 'way-d-frontend',
            };

            // Check build status
            try {
                const packageJson = await fs.readJson(path.join(this.projectRoot, 'package.json'));
                report.version = packageJson.version;
                report.buildConfigured = !!packageJson.scripts?.build;
            } catch (error) {
                report.buildError = error instanceof Error ? error.message : String(error);
            }

            // Check PM2 configuration
            try {
                const pm2ConfigExists = await fs.pathExists(path.join(this.projectRoot, 'tools/deployment/ecosystem.config.cjs'));
                report.pm2Configured = pm2ConfigExists;
            } catch (error) {
                report.pm2Error = error instanceof Error ? error.message : String(error);
            }

            // Check Nginx configuration
            try {
                const nginxConfigExists = await fs.pathExists(path.join(this.projectRoot, 'nginx.conf'));
                report.nginxConfigured = nginxConfigExists;
            } catch (error) {
                report.nginxError = error instanceof Error ? error.message : String(error);
            }

            // Include test results if requested
            if (includeTests) {
                report.tests = {
                    configured: false,
                    passed: false,
                    coverage: 'unknown',
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(report, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Failed to generate deployment report: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async startBackendServices(rebuild: boolean): Promise<CallToolResult> {
        try {
            const wayDRoot = path.join(this.projectRoot, '..');

            let command = 'cd ../.. && ./start-all-services.sh';
            if (rebuild) {
                command = 'cd ../.. && docker-compose down && docker-compose build --no-cache && ./start-all-services.sh';
            }

            const { stdout, stderr } = await execAsync(command);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Backend services startup initiated:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to start backend services: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }

    private async stopBackendServices(removeVolumes: boolean): Promise<CallToolResult> {
        try {
            let command = 'cd ../.. && docker-compose down';
            if (removeVolumes) {
                command = 'cd ../.. && docker-compose down -v';
            }

            const { stdout, stderr } = await execAsync(command);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Backend services stopped:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to stop backend services: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Way-d MCP server running on stdio');
    }
}

const server = new WayDMCPServer();
server.run().catch(console.error);
