const version = process.env.REACT_APP_VERSION;

const welcome = () => ({
  value: `Waves console 0.0.2
Use <strong>:help</strong> to show commands`,
  html: true,
});

const help = () => ({
  value: `
:clear
:history
:about
:version
copy(<value>) and $_ for last value

${about().value}`,
  html: true,
});

const about = () => ({
  value:
    'Built using <a href="https://github.com/remy/console" target="_blank">jsconsole</a>',
  html: true,
});


const history = async ({ app, args: [n = null] }) => {
  const history = app.context.store.getState().history;
  if (n === null) {
    return history.map((item, i) => `${i}: ${item.trim()}`).join('\n');
  }

  // try to re-issue the historical command
  const command = history.find((item, i) => i === n);
  if (command) {
    app.onRun(command);
  }

  return;
};

const clear = ({ console }) => {
  console.clear();
};


const commands = {
  welcome,
  help,
  about,
  clear,
  history,
  version: () => version,
};

export default commands;
