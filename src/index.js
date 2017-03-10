import profile from './profile';
import extensions from './extensions';

export default function createDesktopDrivers( options ) {
  return {
    extensions: extensions( options.extensions ),
    profile: profile( options.profile )
  };
}
