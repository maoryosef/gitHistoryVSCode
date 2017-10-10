import { Container, interfaces } from 'inversify';
import { containerModule as adapterContainer } from '../adapter/ioc';
import { containerModule as parsersContainer } from '../adapter/parsers/ioc';
import { containerModule as repoContainer } from '../adapter/repository/ioc';
import { Logger } from '../common/log';
import { ILogService, IUiService } from '../common/types';
import { UiService } from '../common/uiService';
import { LogViewer } from '../logViewer/logViewer';
import { ThemeService } from '../logViewer/themeService';
import { ILogViewer } from '../logViewer/types';
import { IThemeService } from '../logViewer/types';
import { IDiContainer } from '../types';

export class DiContainer implements IDiContainer {
    private container: Container;
    private static instance: IDiContainer;
    constructor() {
        if (DiContainer.instance) {
            throw new Error('DiContainer is a singleton and can be instantiated only once');
        }
        const cont = this.container = new Container();
        cont.bind<ILogService>(ILogService).to(Logger);
        cont.bind<ILogViewer>(ILogViewer).to(LogViewer);
        cont.bind<IUiService>(IUiService).to(UiService);
        cont.bind<IThemeService>(IThemeService).to(ThemeService);
        cont.load(adapterContainer, repoContainer, parsersContainer);
        DiContainer.instance = this;
    }
    // tslint:disable-next-line:function-name
    public static getInstance(): IDiContainer {
        return DiContainer.instance ? DiContainer.instance : new DiContainer();
    }
    public dispose() {
        // Nothing for now
    }
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return this.container.get<T>(serviceIdentifier);
    }
}