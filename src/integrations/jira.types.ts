export interface JiraIssueResultData {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: {
      id: string;
      name: string;
    };
    [key: string]: unknown;
  };
}

// Jira issue payload shape needed by the integration type guard.
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { id: string; name: string };
    [key: string]: unknown;
  };
}

export interface JiraErrorResponse {
  errorMessages?: string[];
  errors: Record<string, string>;
}
