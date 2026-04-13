async function fetchPage(url) {
  const res = await fetch(url);
  return await res.text();
}
