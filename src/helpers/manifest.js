export const getManifestForActualStand = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostName = window.location.hostname;

  if (hostName === 'localhost') {
    return 'http://localhost:3000/dev.tonconnect-manifest.json';
  }

  if (hostName === 'rocket-launcher-test.vercel.app') {
    return 'https://rocket-launcher-test.vercel.app/stage.tonconnect-manifest.json';
  }

  if (hostName === 'www.rocketlauncher.gg') {
    return 'https://rocketlauncher.gg/prod.tonconnect-manifest.json';
  }
};
