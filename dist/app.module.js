var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { PizzazModule } from './modules/pizzaz/pizzaz.module.js';
/**
 * Root Application Module
 *
 * Pizza shop finder with interactive maps.
 * Showcases NitroStack Widget SDK features.
 */
let AppModule = class AppModule {
};
AppModule = __decorate([
    McpApp({
        module: AppModule,
        server: {
            name: 'pizzaz-finder',
            version: '1.0.0'
        },
        logging: {
            level: 'info'
        }
    }),
    Module({
        name: 'pizzaz',
        description: 'Pizza shop finder with interactive maps',
        imports: [
            ConfigModule.forRoot(),
            PizzazModule
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map