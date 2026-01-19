import {ai} from './genkit';

ai.startFlowServer({
  flows: [
    require('./flows/calculate-final-grade'),
    require('./flows/chatbot'),
  ],
});