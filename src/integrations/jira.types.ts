// Comprehensive Jira REST API v3 Type Definitions
// Based on Atlassian's Jira REST API v3 specification

export interface JiraUser {
	self: string;
	accountId: string;
	emailAddress: string;
	avatarUrls: {
		"16x16": string;
		"24x24": string;
		"32x32": string;
		"48x48": string;
	};
	displayName: string;
	active: boolean;
	timeZone: string;
	accountType: string;
}

export interface JiraIssueType {
	self: string;
	id: string;
	description: string;
	iconUrl: string;
	name: string;
	subtask: boolean;
	avatarId: number;
	hierarchyLevel: number;
}

export interface JiraStatus {
	self: string;
	description: string;
	iconUrl: string;
	name: string;
	id: string;
	statusCategory: {
		self: string;
		id: number;
		key: string;
		colorName: string;
		name: string;
	};
}

export interface JiraPriority {
	self: string;
	iconUrl: string;
	name: string;
	id: string;
}

export interface JiraProject {
	self: string;
	id: string;
	key: string;
	name: string;
	projectTypeKey: string;
	simplified: boolean;
	style: string;
	isPrivate: boolean;
	properties: Record<string, any>;
}

export interface JiraComponent {
	self: string;
	id: string;
	name: string;
	description: string;
	lead: JiraUser;
	assigneeType: string;
	assignee: JiraUser;
	realAssignee: JiraUser;
	isAssigneeTypeValid: boolean;
	project: string;
	projectId: number;
}

export interface JiraVersion {
	self: string;
	id: string;
	description: string;
	name: string;
	archived: boolean;
	released: boolean;
	releaseDate: string;
	userReleaseDate: string;
	projectId: number;
}

export interface JiraFixVersion {
	self: string;
	id: string;
	description: string;
	name: string;
	archived: boolean;
	released: boolean;
	releaseDate: string;
	userReleaseDate: string;
	projectId: number;
}

export interface JiraCustomField {
	id: string;
	name: string;
	value: any;
}

// Main Jira Issue interface with comprehensive typing
export interface JiraIssue {
	expand: string;
	id: string;
	self: string;
	key: string;
	fields: {
		summary: string;
		description: string | null;
		issuetype: JiraIssueType;
		project: JiraProject;
		status: JiraStatus;
		priority: JiraPriority;
		assignee: JiraUser | null;
		creator: JiraUser;
		reporter: JiraUser;
		created: string;
		updated: string;
		duedate: string | null;
		resolution: {
			self: string;
			id: string;
			description: string;
			name: string;
		} | null;
		resolutiondate: string | null;
		labels: string[];
		components: JiraComponent[];
		fixVersions: JiraFixVersion[];
		versions: JiraVersion[];
		environment: string | null;
		timetracking: {
			originalEstimate: string;
			remainingEstimate: string;
			timeSpent: string;
			originalEstimateSeconds: number;
			remainingEstimateSeconds: number;
			timeSpentSeconds: number;
		} | null;
		// Custom fields (these will vary by Jira instance)
		customfield_10359?: {
			id: string;
			name: string;
			value: any;
		};
		// Add more custom fields as needed
		[key: string]: any;
	};
	renderedFields: {
		description: string | null;
		comment: {
			comments: Array<{
				id: string;
				author: JiraUser;
				body: string;
				created: string;
				updated: string;
			}>;
		};
	};
	operations: {
		linkGroups: Array<{
			id: string;
			styleClass: string;
			header: {
				id: string;
				label: string;
			};
			weight: number;
			links: Array<{
				id: string;
				styleClass: string;
				iconClass: string;
				label: string;
				title: string;
				href: string;
				weight: number;
			}>;
		}>;
	};
	editMeta: {
		fields: Record<string, any>;
	};
	changelog: {
		startAt: number;
		maxResults: number;
		total: number;
		histories: Array<{
			id: string;
			author: JiraUser;
			created: string;
			items: Array<{
				field: string;
				fieldtype: string;
				fieldId: string;
				from: string;
				fromString: string;
				to: string;
				toString: string;
			}>;
		}>;
	};
}

// Simplified version for your current use case
export interface JiraIssueResultData {
	id: string;
	key: string;
	fields: {
		summary: string;
		description: string | null;
		issuetype: {
			id: string;
			name: string;
		};
		status: {
			name: string;
		};
		project: {
			key: string;
			name: string;
		};
		assignee: JiraUser | null;
		creator: JiraUser;
		reporter: JiraUser;
		created: string;
		updated: string;
		priority: {
			name: string;
		};
		labels: string[];
		// Custom fields
		customfield_10359?: {
			id: string;
			name: string;
			value: any;
		};
		[key: string]: any;
	};
}

// Error response type
export interface JiraErrorResponse {
	errorMessages: string[];
	errors: Record<string, string>;
}

// API response wrapper
export type JiraApiResponse<T> = T | JiraErrorResponse;
