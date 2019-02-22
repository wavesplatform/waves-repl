import { WavesConsoleCommands } from '../../WavesConsoleCommands';
import { Console } from '../components/Console';

export const bindConsoleCommandsToCommands = (consoleCommands: WavesConsoleCommands, console: Console) => {
    const methods = [
        'log',
        'error',
        'clear'
    ];

    methods.forEach(method => {
        consoleCommands[method] = console[method as keyof Console];
    });
};