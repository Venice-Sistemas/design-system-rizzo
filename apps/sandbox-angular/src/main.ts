import 'zone.js';

// O CSS global entra por angular.json, que é o caminho idiomático em Angular e o
// único em que o builder resolve os arquivos de fonte do @font-face.

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app.component';

bootstrapApplication(App).catch((error) => console.error(error));
