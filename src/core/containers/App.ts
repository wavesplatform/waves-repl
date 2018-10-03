import { connect } from 'react-redux';
import App from '../components/App';
import { setTheme, setLayout } from '../actions/Settings';
import { setEnv } from "../actions/Env";

export default connect(({settings}) => ({
  theme: settings.theme,
  layout: settings.layout,
  env: settings.env
}), { setTheme, setLayout, setEnv })(App);