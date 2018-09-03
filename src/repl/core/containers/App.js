import { connect } from 'react-redux';
import App from '../components/App';
import { setTheme, setLayout } from '../actions/Settings';

export default connect(({settings}) => ({
  theme: settings.theme,
  layout: settings.layout,
  env: settings.env
}), { setTheme, setLayout })(App);