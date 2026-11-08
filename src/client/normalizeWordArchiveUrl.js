// GitHub Pages aliases open the generated .html file. Normalize its address
// before Docusaurus preloads routes so SSR and the client use the same route.
// Other site paths, query strings and hashes retain their existing behavior.
if (typeof window !== 'undefined') {
  const {pathname, search, hash} = window.location;
  if (/\/my-tide\/words(?:\/(?:nostalgia|enthusiasm|humble|humidity|mission))?\.html$/.test(pathname)) {
    window.history.replaceState(window.history.state, '', `${pathname.slice(0, -5)}${search}${hash}`);
  }
}
