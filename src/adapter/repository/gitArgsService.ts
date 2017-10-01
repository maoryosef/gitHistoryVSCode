import { Helpers } from '../helpers';
import { CommitInfo } from '../types';
import { LOG_ENTRY_SEPARATOR, LOG_FORMAT, newLineFormatCode } from './constants';
import { GitLogArgs, IGitArgsService } from './types';

export class GitArgsService implements IGitArgsService {
    constructor(private isWindows: boolean = /^win/.test(process.platform)) { }

    public getGitRootArgs(): string[] {
        return ['rev-parse', '--show-toplevel'];
    }
    public getCurrentBranchArgs(): string[] {
        return ['rev-parse', '--abbrev-ref', 'HEAD'];
    }
    public getCommitDateArgs(hash: string) {
        return ['show', `--format=${Helpers.GetCommitInfoFormatCode(CommitInfo.CommitterDateUnixTime)}`, hash];
    }
    public getCommitWithNumStatArgs(hash: string) {
        return ['show', LOG_FORMAT, '--decorate=full', '--numstat', hash];
    }
    public getCommitNameStatusArgs(hash: string): string[] {
        return ['show', `--format=${LOG_ENTRY_SEPARATOR}${newLineFormatCode}`, '--decorate=full', '--name-status', hash];
    }
    public getObjectHashArgs(object: string): string[] {
        return ['show', `--format=${Helpers.GetCommitInfoFormatCode(CommitInfo.FullHash)}`, '--shortstat', object];
    }
    public getRefsContainingCommitArgs(hash: string): string[] {
        return ['git', 'branch', '--all', '--contains', hash];
    }
    public getLogArgs(pageIndex: number = 0, pageSize: number = 100, branch: string = '', searchText: string = '', relativeFilePath?: string): GitLogArgs {
        const allBranches = branch.trim().length === 0;
        const currentBranch = branch.trim() === '*';
        const specificBranch = !allBranches && !currentBranch;

        const logArgs = ['log', LOG_FORMAT];
        const fileStatArgs = ['log', `--format=${LOG_ENTRY_SEPARATOR}${newLineFormatCode}`];
        // TODO: Don't we need %n instead of %h
        const counterArgs = ['log', `--format=${LOG_ENTRY_SEPARATOR}%h`];

        if (searchText && searchText.length > 0) {
            searchText.split(' ')
                .map(text => text.trim())
                .filter(text => text.length > 0)
                .forEach(text => {
                    logArgs.push(`--grep=${text}`);
                    fileStatArgs.push(`--grep=${text}`);
                    counterArgs.push(`--grep=${text}`);
                });
        }

        logArgs.push('--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`);
        fileStatArgs.push('--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`);
        counterArgs.push('--date-order', '--decorate=full');

        if (allBranches) {
            logArgs.push('--all');
            fileStatArgs.push('--all');
            counterArgs.push('--all');
        }

        // Check if we need a specific file
        if (relativeFilePath) {
            logArgs.push(relativeFilePath);
            fileStatArgs.push(relativeFilePath);
            counterArgs.push(relativeFilePath);
        }
        // logArgs.push('--numstat');
        // fileStatArgs.push('--name-status');

        // Count only the number of lines in the log
        if (this.isWindows) {
            counterArgs.push('|', 'find', '/c', '/v', '""');
        }
        else {
            counterArgs.push('|', 'wc', '-l');
        }

        if (specificBranch) {
            logArgs.push(branch);
            fileStatArgs.push(branch);
            counterArgs.push(branch);
        }

        return { logArgs, fileStatArgs, counterArgs };
    }
}
