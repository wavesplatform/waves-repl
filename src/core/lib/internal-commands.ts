const version = process.env.REACT_APP_VERSION;

interface IResp {
    value: string,
    html: boolean
}
const welcome: () => IResp = () => ({
    value: `Waves console 1.0.8
Use <strong>:help</strong> to show commands`,
    html: true,
});

const help: () => IResp = () => ({
    value: `
:clear
:history
:about
:version
copy(<value>) and $_ for last value

${about().value}`,
    html: true,
});

const about: () => IResp = () => ({
    value:
        'Built using <a href="https://github.com/remy/console" target="_blank">jsconsole</a>',
    html: true,
});


const history = async ({app, args: [n = null]}:any) => {
    const history = app.context.store.getState().history;
    if (n === null) {
        return history.map((item:any, i:number) => `${i}: ${item.trim()}`).join('\n');
    }

    // try to re-issue the historical command
    const command = history.find((item:any, i:number) => i === n);
    if (command) {
        app.onRun(command);
    }

    return;
};

const clear = ({console}:any) => {
    console.clear();
};


const commands: any = {
    welcome,
    help,
    about,
    clear,
    history,
    version: () => version,
};

export default commands;
