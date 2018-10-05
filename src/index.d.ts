declare module 'waves-repl' {
    import * as React from 'react';

    interface IReplProps {
        theme: string;
    }
    export class Repl extends React.Component<IReplProps> {
        constructor(props: IReplProps);
        static updateEnv(env: any): void;
        render(): JSX.Element;
    }
    export {};
}

