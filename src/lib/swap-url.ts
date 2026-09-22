// Update the address bar without a route transition, for tools that mirror state in the URL
export function swapUrl(href: string) {
  window.history.replaceState(null, "", href);
}
