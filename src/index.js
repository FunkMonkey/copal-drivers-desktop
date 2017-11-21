import profile from './profile';
import plugins from './plugins';

export default function createDesktopDrivers( options ) {
  return {
    plugins: plugins( options.plugins ),
    profile: profile( options.profile )
  };
}
