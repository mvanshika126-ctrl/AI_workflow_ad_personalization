document.getElementById("btn").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value;

  const response = await fetch("https://r.jina.ai/" + url);
  const pageContent = await response.text();

  console.log(pageContent);

  document.getElementById("output").innerText = pageContent.slice(0, 1000);
});
