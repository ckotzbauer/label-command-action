
export interface CommandConfig {
    command: string;
    arg: string;
    action: string;
    label: string;
    dispatch?: string;
}

export interface Command {
    command: string;
    arg: string;
    dispatch?: string;
}
