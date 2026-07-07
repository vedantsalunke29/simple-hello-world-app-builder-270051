export type AgentConfig = {
    id: string;
    name: string;
    description: string;
    config: {
        appId: string;
        accountId: string;
        widgetKey: string;
        agentExecutorVersion?: string;
    };
};

export type AgentEventType =
    | 'thinking_started'
    | 'thinking_completed'
    | 'guardrail_started'
    | 'guardrail_ended'
    | 'strategy_updated'
    | 'thinking_failed'
    | 'intermediate'
    | 'final'
    | 'question'
    | 'workflow_task'
    | 'final_stream'
    | 'attach_files'
    | 'output_files'
    | 'ask_permission'
    | 'ask_permission_result'
    | 'ask_credential'
    | 'ask_credential_result'
    | 'compaction_started'
    | 'compaction_ended'
    | 'compaction_failed'
    | 'compaction_usage';
