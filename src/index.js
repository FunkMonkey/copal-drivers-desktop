import profile from './profile';

export default function createDesktopDrivers( options ) {
  return {
    profile: profile( options.profile )
  };
}
