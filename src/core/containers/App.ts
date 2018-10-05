import { connect } from 'react-redux';
import {App as AppComponent} from '../components/App';
import { setTheme, setLayout } from '../actions/Settings';
import { setEnv } from "../actions/Env";

export const App = connect(({settings}:any) => ({
  theme: settings.theme,
  layout: settings.layout,
  env: settings.env
}), { setTheme, setLayout, setEnv })(AppComponent);